package com.example.demo.constant;

public enum IncomeExpense {

    INCOME(0),
    EXPENSE(1);

    private int value;

    IncomeExpense(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

}