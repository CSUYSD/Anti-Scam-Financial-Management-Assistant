package com.example.demo.service;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.when;

import com.example.demo.model.FinancialReport;
import com.example.demo.model.TransactionUser;
import com.example.demo.repository.FinancialReportRepository;
import com.example.demo.repository.TransactionUserDao;
import com.example.demo.utility.GetCurrentUserInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class FinancialReportServiceTest {

    private FinancialReportService financialReportService;

    @Mock
    private GetCurrentUserInfo getCurrentUserInfo;

    @Mock
    private TransactionUserDao transactionUserDao;

    @Mock
    private FinancialReportRepository financialReportRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        financialReportService = new FinancialReportService(
                getCurrentUserInfo,
                transactionUserDao,
                financialReportRepository
        );
    }

    @Test
    public void getFinancialReports_WhenUserRole_ShouldReturnUserReports() {
        // Arrange
        String token = "test-token";
        Long userId = 1L;

        TransactionUser user = new TransactionUser();
        List<FinancialReport> expectedReports = createTestReports();
        user.setFinancialReports(expectedReports);

        when(getCurrentUserInfo.getCurrentUserRole(token)).thenReturn("ROLE_USER");
        when(getCurrentUserInfo.getCurrentUserId(token)).thenReturn(userId);
        when(transactionUserDao.findById(userId)).thenReturn(Optional.of(user));

        // Act
        List<FinancialReport> result = financialReportService.getFinancialReports(token);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyElementsIn(expectedReports);
    }

    @Test
    public void getFinancialReports_WhenNonUserRole_ShouldReturnEmptyList() {
        // Arrange
        String token = "admin-token";
        when(getCurrentUserInfo.getCurrentUserRole(token)).thenReturn("ROLE_ADMIN");

        // Act
        List<FinancialReport> result = financialReportService.getFinancialReports(token);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    public void getFinancialReports_WhenUserHasNoReports_ShouldReturnEmptyList() {
        // Arrange
        String token = "test-token";
        Long userId = 1L;

        TransactionUser user = new TransactionUser();
        user.setFinancialReports(new ArrayList<>());

        when(getCurrentUserInfo.getCurrentUserRole(token)).thenReturn("ROLE_USER");
        when(getCurrentUserInfo.getCurrentUserId(token)).thenReturn(userId);
        when(transactionUserDao.findById(userId)).thenReturn(Optional.of(user));

        // Act
        List<FinancialReport> result = financialReportService.getFinancialReports(token);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    private List<FinancialReport> createTestReports() {
        List<FinancialReport> reports = new ArrayList<>();

        FinancialReport report1 = new FinancialReport();
        report1.setId(1L);
        reports.add(report1);

        FinancialReport report2 = new FinancialReport();
        report2.setId(2L);
        reports.add(report2);

        return reports;
    }
}