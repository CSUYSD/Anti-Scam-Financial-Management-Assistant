package com.example.demo.repository;

import com.example.demo.config.TestConfig;
import com.example.demo.model.security.UserRole;
import com.google.common.truth.Truth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestContextManager;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

@SpringBootTest
@Import(TestConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.main.allow-bean-definition-overriding=true"
})
class UserRoleDaoTest {
    @Autowired
    private UserRoleDao userRoleDao;

    @Autowired
    private ConfigurableApplicationContext applicationContext;

    private TestContextManager testContextManager;

    public static void main(String[] args) throws Exception {
        UserRoleDaoTest test = new UserRoleDaoTest();
        try {
            test.setup();
            test.testFindByRole();
            System.out.println("All tests passed successfully!");
        } finally {
            if (test.applicationContext != null) {
                test.applicationContext.close();
            }
            System.exit(0);
        }
    }

    public void setup() throws Exception {
        this.testContextManager = new TestContextManager(getClass());
        this.testContextManager.prepareTestInstance(this);
        initTestData();
    }

    private void initTestData() {
        // 创建管理员角色
        UserRole adminRole = new UserRole();
        adminRole.setRole_id(1);
        adminRole.setRole("ROLE_ADMIN");
        userRoleDao.save(adminRole);

        // 创建普通用户角色
        UserRole userRole = new UserRole();
        userRole.setRole_id(2);
        userRole.setRole("ROLE_USER");
        userRoleDao.save(userRole);
    }

    public void testFindByRole() {
        // 测试查找管理员角色
        Optional<UserRole> adminRole = userRoleDao.findByRole("ROLE_ADMIN");
        Truth.assertThat(adminRole.isPresent()).isTrue();
        Truth.assertThat(adminRole.get().getRoleName()).isEqualTo("ROLE_ADMIN");
        Truth.assertThat(adminRole.get().getRole_id()).isEqualTo(1);

        // 测试查找普通用户角色
        Optional<UserRole> userRole = userRoleDao.findByRole("ROLE_USER");
        Truth.assertThat(userRole.isPresent()).isTrue();
        Truth.assertThat(userRole.get().getRoleName()).isEqualTo("ROLE_USER");
        Truth.assertThat(userRole.get().getRole_id()).isEqualTo(2);

        // 测试查找不存在的角色
        Optional<UserRole> nonExistentRole = userRoleDao.findByRole("ROLE_NONEXISTENT");
        Truth.assertThat(nonExistentRole.isPresent()).isFalse();

        System.out.println("testFindByRole passed!");
    }
}