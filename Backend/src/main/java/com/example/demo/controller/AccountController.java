package com.example.demo.controller;

import com.example.demo.exception.AccountNotFoundException;
import com.example.demo.model.Account;
import com.example.demo.service.AccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/account")
public class AccountController {
    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);

    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/allaccounts")
    public ResponseEntity<List<Account>> getAllAccounts() {
        List<Account> accounts = accountService.findAll();
        if (!accounts.isEmpty()) {
            return ResponseEntity.ok(accounts);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        Optional<Account> accountOptional = accountService.findById(id);
        return accountOptional.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }


    @GetMapping("/byUsername")
    public ResponseEntity<List<Account>> getAccountsByUsername(@RequestParam String username) {
        List<Account> accounts = accountService.findByUsername(username);
        if (!accounts.isEmpty()) {
            return ResponseEntity.ok(accounts);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/byTransactionUserId")
    public ResponseEntity<List<Account>> getAccountsByTransactionUserId(@RequestParam Long userId) {
        List<Account> accounts = accountService.findByTransactionUsersId(userId);
        if (!accounts.isEmpty()) {
            return ResponseEntity.ok(accounts);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/all")
    public String getAccountInfo() {
        return "Account Information";
    }

    @GetMapping("/byAccountName")
    public ResponseEntity<Account> getAccountByAccountName(@RequestParam String accountName) {
        Optional<Account> accountOptional = accountService.findByAccountName(accountName);
        return accountOptional.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/byUsernameAndAccountName")
    public ResponseEntity<Account> getAccountByUsernameAndAccountName(@RequestParam String username, @RequestParam String accountName) {
        Optional<Account> accountOptional = accountService.findByUsernameAndAccountName(username, accountName);
        return accountOptional.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/withTransactions")
    public ResponseEntity<List<Account>> getAllAccountsWithTransactionsByUserId(@RequestParam Long userId) {
        List<Account> accounts = accountService.findAllAccountsWithTransactionsByUserId(userId);
        if (!accounts.isEmpty()) {
            return ResponseEntity.ok(accounts);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<String> createAccount(@RequestBody Account account) {
        try {
            accountService.saveAccount(account);
            return ResponseEntity.status(HttpStatus.CREATED).body("Account has been created");
        } catch (DataIntegrityViolationException e) {
            logger.error("Error creating account: ", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error creating account: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateAccount(@PathVariable Long id, @RequestBody Account accountDetails) {
        try {
            accountService.updateAccount(id, accountDetails);
            return ResponseEntity.ok("Account updated successfully");
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating account: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating account: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAccount(@PathVariable Long id) {
        try {
            accountService.deleteAccount(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (AccountNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            logger.error("Error deleting account: ", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error deleting account: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error deleting account: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred: " + e.getMessage());
        }
    }
}
