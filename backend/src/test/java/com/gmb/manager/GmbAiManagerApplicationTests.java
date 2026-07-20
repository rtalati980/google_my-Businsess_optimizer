package com.gmb.manager;

import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.mapping.MongoPersistentEntity;
import org.springframework.data.mongodb.core.mapping.MongoPersistentProperty;
import java.util.*;

@SpringBootTest
public class GmbAiManagerApplicationTests {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Test
    void testMongoConnectionAndSchema() {
        System.out.println("======================================================================");
        System.out.println("🔍 DATABASE SCHEMA & COLLECTION VERIFICATION REPORT");
        System.out.println("======================================================================");

        try {
            Set<String> actualCollections = mongoTemplate.getCollectionNames();
            System.out.println("📂 Actual Collections in MongoDB: " + actualCollections);
            System.out.println();

            Collection<? extends MongoPersistentEntity<?>> entities = mongoTemplate.getConverter()
                    .getMappingContext().getPersistentEntities();

            List<String> missingCollections = new ArrayList<>();
            List<String> matchingCollections = new ArrayList<>();

            for (MongoPersistentEntity<?> entity : entities) {
                String collectionName = entity.getCollection();
                Class<?> type = entity.getType();

                // Skip internal Spring classes if any
                if (!type.getName().startsWith("com.gmb.manager")) {
                    continue;
                }

                System.out.println("Entity Class: " + type.getSimpleName());
                System.out.println("Expected Collection: \"" + collectionName + "\"");

                boolean exists = actualCollections.contains(collectionName);
                if (exists) {
                    matchingCollections.add(collectionName);
                    System.out.println("Status: 🟢 Present in database");

                    // Analyze sample document to check for missing/mismatching fields
                    Document sampleDoc = mongoTemplate.getDb().getCollection(collectionName).find().first();
                    if (sampleDoc != null) {
                        System.out.println("  Analyzing sample document fields...");
                        Set<String> docKeys = sampleDoc.keySet();
                        Set<String> entityFields = new HashSet<>();

                        for (MongoPersistentProperty property : entity) {
                            entityFields.add(property.getFieldName());
                        }

                        // Check if any fields in database are not mapped in Java entity
                        List<String> unmappedDbFields = new ArrayList<>();
                        for (String key : docKeys) {
                            if (!key.equals("_class") && !entityFields.contains(key)) {
                                unmappedDbFields.add(key);
                            }
                        }

                        // Check if any fields in Java entity are not present in the sample database doc
                        List<String> missingInDbSample = new ArrayList<>();
                        for (MongoPersistentProperty property : entity) {
                            String fieldName = property.getFieldName();
                            if (!fieldName.equals("id") && !docKeys.contains(fieldName)) {
                                missingInDbSample.add(fieldName);
                            }
                        }

                        if (!unmappedDbFields.isEmpty()) {
                            System.out.println("  ⚠️ Fields in DB sample not mapped to Java fields: " + unmappedDbFields);
                        }
                        if (!missingInDbSample.isEmpty()) {
                            System.out.println("  ℹ️ Fields defined in Java but missing in this DB sample (normal if empty/optional): " + missingInDbSample);
                        }
                        if (unmappedDbFields.isEmpty() && missingInDbSample.isEmpty()) {
                            System.out.println("  ✅ Perfect 1:1 field mapping match!");
                        }
                    } else {
                        System.out.println("  ℹ️ Collection is empty (no sample document to analyze).");
                    }
                } else {
                    missingCollections.add(collectionName);
                    System.out.println("Status: 🟡 Not created yet (MongoDB automatically creates collections on first document write).");
                }
                System.out.println("----------------------------------------------------------------------");
            }

            System.out.println("\n📊 SUMMARY VERIFICATION RESULTS:");
            System.out.println("======================================================================");
            System.out.println("🟢 Active Collections Found: " + matchingCollections.size());
            System.out.println("🟡 Empty / Not-yet-created Collections: " + missingCollections.size() + " " + missingCollections);
            System.out.println("======================================================================");

        } catch (Exception e) {
            System.err.println("❌ FAILED TO RUN SCHEMA VERIFICATION:");
            e.printStackTrace();
            throw e;
        }
    }
}
