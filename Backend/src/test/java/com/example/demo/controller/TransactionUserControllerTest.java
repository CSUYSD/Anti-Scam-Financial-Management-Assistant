package com.example.demo.controller;




import com.example.demo.controller.TransactionUserController;
import com.example.demo.exception.UserNotFoundException;




import com.example.demo.model.TransactionUser;
import com.example.demo.model.dto.TransactionUserDTO;
import com.example.demo.service.TransactionUserService;
import com.google.common.truth.Truth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;








import java.util.Collections;
import java.util.List;
import java.util.Optional;




import static com.google.common.truth.Truth.assertThat;
import static java.lang.reflect.Array.get;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;




public class TransactionUserControllerTest {




    private MockMvc mockMvc;




    @InjectMocks
    private TransactionUserController transactionUserController;




    @Mock
    private TransactionUserService transactionUserService;




    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(transactionUserController).build();
    }




    @Test
    public void testGetAllUsers_Success() {
        // Given
        TransactionUser user1 = new TransactionUser();
        user1.setId(1L);
        user1.setUsername("user1");




        TransactionUser user2 = new TransactionUser();
        user2.setId(2L);
        user2.setUsername("user2");




        when(transactionUserService.findAll()).thenReturn(List.of(user1, user2));




        // When
        ResponseEntity<List<TransactionUser>> response = transactionUserController.getAllUsers();




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0).getUsername()).isEqualTo("user1");
        assertThat(response.getBody().get(1).getUsername()).isEqualTo("user2");




        verify(transactionUserService, times(1)).findAll();
    }




    @Test
    public void testGetAllUsers_NoContent() throws Exception {
        // Mock the service to return an empty list
        when(transactionUserService.findAll()).thenReturn(Collections.emptyList());




        // Perform the GET request
        MvcResult result = mockMvc.perform(get("/users/allusers")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())  // Expecting 404 NOT_FOUND
                .andReturn();




        // Validate the status and response
        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
    }
















    @Test
    public void testGetUserById_Success() {
        // Given
        TransactionUser user = new TransactionUser();
        user.setId(1L);
        user.setUsername("testUser");




        when(transactionUserService.findById(anyLong())).thenReturn(Optional.of(user));




        // When
        ResponseEntity<TransactionUser> response = transactionUserController.getUserById(1L);




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getUsername()).isEqualTo("testUser");




        verify(transactionUserService, times(1)).findById(1L);
    }




    @Test
    public void testGetUserById_NotFound() {
        // Given
        when(transactionUserService.findById(anyLong())).thenReturn(Optional.empty());




        // When
        ResponseEntity<TransactionUser> response = transactionUserController.getUserById(1L);




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();




        verify(transactionUserService, times(1)).findById(1L);
    }




    @Test
    public void testGetUserByUsername_Success() {
        // Given
        TransactionUser user = new TransactionUser();
        user.setUsername("testUser");




        when(transactionUserService.findByUsername(anyString())).thenReturn(Optional.of(user));




        // When
        ResponseEntity<TransactionUser> response = transactionUserController.getUserByUsername("testUser");




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getUsername()).isEqualTo("testUser");




        verify(transactionUserService, times(1)).findByUsername("testUser");
    }




    @Test
    public void testGetUserByUsername_NotFound() {
        // Given
        when(transactionUserService.findByUsername(anyString())).thenReturn(Optional.empty());




        // When
        ResponseEntity<TransactionUser> response = transactionUserController.getUserByUsername("unknownUser");




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();




        verify(transactionUserService, times(1)).findByUsername("unknownUser");
    }




    @Test
    public void testUpdateUser_Success() throws UserNotFoundException {
        // Given
        TransactionUserDTO userDetails = new TransactionUserDTO();  // 改用 DTO
        userDetails.setUsername("updatedUser");




        doNothing().when(transactionUserService).updateUser(anyString(), any(TransactionUserDTO.class));




        // When
        ResponseEntity<String> response = transactionUserController.updateUser("1", userDetails);




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("User updated successfully");




        verify(transactionUserService, times(1)).updateUser("1", userDetails);
    }




    @Test
    public void testDeleteUser_Success() throws UserNotFoundException {
        // Given
        doNothing().when(transactionUserService).deleteUser(anyLong());




        // When
        ResponseEntity<String> response = transactionUserController.deleteUser(1L);




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("User deleted successfully");




        verify(transactionUserService, times(1)).deleteUser(1L);
    }




    @Test
    public void testGetCurrentUserInfo_Success() {
        // Given
        TransactionUserDTO userDTO = new TransactionUserDTO();
        userDTO.setUsername("currentUser");




        when(transactionUserService.getUserInfoByUserId(anyString())).thenReturn(Optional.of(userDTO));




        // When
        ResponseEntity<TransactionUserDTO> response = transactionUserController.getCurrentUserInfo("Bearer testToken");




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getUsername()).isEqualTo("currentUser");




        verify(transactionUserService, times(1)).getUserInfoByUserId("Bearer testToken");
    }




    @Test
    public void testUpdateAvatar_Success() throws UserNotFoundException {
        // Given
        doNothing().when(transactionUserService).updateAvatar(anyString(), anyString());




        // When
        ResponseEntity<String> response = transactionUserController.updateAvatar("Bearer testToken", "https://example.com/avatar.jpg");




        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Avatar updated successfully");




        verify(transactionUserService, times(1)).updateAvatar("Bearer testToken", "https://example.com/avatar.jpg");
    }
}
