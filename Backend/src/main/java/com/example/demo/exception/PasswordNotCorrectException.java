package com.example.demo.exception;

public class PasswordNotCorrectException extends Exception {
    public PasswordNotCorrectException(String message) {
        super(message);
    }
}
