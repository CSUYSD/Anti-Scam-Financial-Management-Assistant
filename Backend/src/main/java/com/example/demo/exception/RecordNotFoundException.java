package com.example.demo.exception;

public class RecordNotFoundException extends RuntimeException{
    public RecordNotFoundException(String s) {
        super(s);
    }
}
