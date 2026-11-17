package com.inventory.smartinventory.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private boolean success;
    private String message;
    private LocalDateTime timestamp;
    private int status;

    public ErrorResponse() {}

    public ErrorResponse(String message, int status) {
        this.success = false;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.status = status;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
}
