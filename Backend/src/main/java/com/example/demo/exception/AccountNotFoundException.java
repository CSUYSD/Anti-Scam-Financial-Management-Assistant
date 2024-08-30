package com.example.demo.exception;

public class AccountNotFoundException extends RuntimeException {
  public AccountNotFoundException(String s) {
    super(s);
  }
}