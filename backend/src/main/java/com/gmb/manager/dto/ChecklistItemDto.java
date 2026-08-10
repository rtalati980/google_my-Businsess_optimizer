package com.gmb.manager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for a checklist item.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItemDto {
    private String label;
    private boolean completed;
}
