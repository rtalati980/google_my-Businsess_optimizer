package com.gmb.manager.controller;

import com.gmb.manager.entity.Subscription;
import com.gmb.manager.entity.User;
import com.gmb.manager.repository.SubscriptionRepository;
import com.gmb.manager.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions/razorpay")
@RequiredArgsConstructor
@Slf4j
public class RazorpayController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Value("${app.razorpay.key-id}")
    private String keyId;

    @Value("${app.razorpay.key-secret}")
    private String keySecret;

    /**
     * Create Razorpay Order
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @AuthenticationPrincipal User userParam,
            @RequestBody Map<String, String> request
    ) {
        String planType = request.get("planType");
        if (planType == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Plan type is required"));
        }

        long amountInPaise;
        if (planType.equalsIgnoreCase("PREMIUM")) {
            amountInPaise = 149900L; // ₹1,499 = 149900 paise
        } else if (planType.equalsIgnoreCase("BASIC")) {
            amountInPaise = 99900L; // ₹999 = 99900 paise
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid plan type"));
        }

        // Check if credentials are mock/default for developer fallback
        if (keyId == null || keyId.equals("rzp_test_your_key_id") || keyId.isEmpty()) {
            log.warn("Razorpay key-id is not configured or mock. Returning simulated order.");
            String mockOrderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 8);
            return ResponseEntity.ok(Map.of(
                    "orderId", mockOrderId,
                    "amount", amountInPaise,
                    "currency", "INR",
                    "keyId", "rzp_test_mock_key_id",
                    "simulation", true
            ));
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

            Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");

            return ResponseEntity.ok(Map.of(
                    "orderId", orderId,
                    "amount", amountInPaise,
                    "currency", "INR",
                    "keyId", keyId,
                    "simulation", false
            ));

        } catch (Exception e) {
            log.error("Failed to create Razorpay order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to initialize payment gateway: " + e.getMessage()));
        }
    }

    /**
     * Verify payment signature and update subscription status
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal User userParam,
            @RequestBody Map<String, String> payload
    ) {
        String orderId = payload.get("razorpayOrderId");
        String paymentId = payload.get("razorpayPaymentId");
        String signature = payload.get("razorpaySignature");
        String planType = payload.get("planType");

        if (orderId == null || planType == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Order ID and plan type are required"));
        }

        User user = userRepository.findById(userParam.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // If order was simulated, allow verification directly
        boolean isVerified = false;
        if (orderId.startsWith("order_mock_")) {
            log.info("Simulated checkout verified for user: {}", user.getEmail());
            isVerified = true;
            paymentId = paymentId != null ? paymentId : "pay_mock_" + UUID.randomUUID().toString().substring(0, 8);
        } else {
            if (paymentId == null || signature == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment ID and signature are required"));
            }
            isVerified = verifyHmacSignature(orderId, paymentId, signature, keySecret);
        }

        if (!isVerified) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid signature. Payment verification failed."));
        }

        // Update user subscription in MongoDB
        Subscription subscription = subscriptionRepository.findByUserId(user.getId())
                .orElse(null);

        if (subscription == null) {
            subscription = Subscription.builder()
                    .userId(user.getId())
                    .planType(planType.toUpperCase())
                    .status("ACTIVE")
                    .stripeSubscriptionId(orderId) // Map to existing schema identifier fields
                    .stripeCustomerId(paymentId)
                    .currentPeriodEnd(LocalDateTime.now().plusDays(30))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        } else {
            subscription.setPlanType(planType.toUpperCase());
            subscription.setStatus("ACTIVE");
            subscription.setStripeSubscriptionId(orderId);
            subscription.setStripeCustomerId(paymentId);
            subscription.setCurrentPeriodEnd(LocalDateTime.now().plusDays(30));
            subscription.setUpdatedAt(LocalDateTime.now());
        }

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("Subscription successfully activated for user: {} with plan: {}", user.getEmail(), planType);

        return ResponseEntity.ok(saved);
    }

    /**
     * Compute HMAC SHA256 Signature to compare with Razorpay's signature
     */
    private boolean verifyHmacSignature(String orderId, String paymentId, String signature, String secret) {
        try {
            String data = orderId + "|" + paymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secretKey);
            byte[] rawHmac = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : rawHmac) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            log.error("Signature HMAC calculation failed", e);
            return false;
        }
    }
}
