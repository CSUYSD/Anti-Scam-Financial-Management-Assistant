//package controller.es;
//
//import com.example.demo.controller.es.RecordESController;
//import com.example.demo.model.TransactionRecordES;
//import com.example.demo.service.es.RecordSearchService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockitoAnnotations;
//import org.springframework.data.elasticsearch.core.SearchHit;
//import org.springframework.data.elasticsearch.core.SearchHits;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.MvcResult;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//import java.util.List;
//
//import static com.google.common.truth.Truth.assertThat;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyInt;
//import static org.mockito.ArgumentMatchers.anyDouble;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//import static org.mockito.Mockito.mock;
//
//public class RecordESControllerTest {
//
//    private MockMvc mockMvc;
//
//    @Mock
//    private RecordSearchService recordSearchService;
//
//    @InjectMocks
//    private RecordESController recordESController;
//
//    @BeforeEach
//    public void setup() {
//        MockitoAnnotations.openMocks(this);
//        mockMvc = MockMvcBuilders.standaloneSetup(recordESController).build();
//    }
//
//    @Test
//    public void testSearchRecords() throws Exception {
//        // 模拟返回的TransactionRecordES
//        TransactionRecordES record = new TransactionRecordES();
//        record.setTransactionDescription("testKeyword");
//
//        // 模拟服务层返回
//        when(recordSearchService.searchRecords(anyString(), anyInt(), anyInt())).thenReturn(List.of(record));
//
//        // 模拟请求
//        MvcResult result = mockMvc.perform(get("/records-search/search")
//                        .param("keyword", "testKeyword")
//                        .param("page", "0")
//                        .param("size", "10"))
//                .andExpect(status().isOk())
//                .andReturn();
//
//        // 验证响应内容
//        assertThat(result.getResponse().getContentAsString()).contains("testKeyword");
//        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
//    }
//
//    @Test
//    public void testAdvancedSearch() throws Exception {
//        // 模拟返回的SearchHits
//        SearchHit<TransactionRecordES> mockSearchHit = mock(SearchHit.class);
//        when(mockSearchHit.getContent()).thenReturn(new TransactionRecordES());
//
//        SearchHits<TransactionRecordES> mockSearchHits = mock(SearchHits.class);
//        when(mockSearchHits.getSearchHits()).thenReturn(List.of(mockSearchHit));
//
//        // 模拟服务层返回
//        when(recordSearchService.advancedSearch(anyString(), anyString(), anyDouble(), anyDouble()))
//                .thenReturn(mockSearchHits);
//
//        // 模拟请求
//        MvcResult result = mockMvc.perform(get("/records-search/advanced-search")
//                        .param("description", "testDescription")
//                        .param("type", "EXPENSE")
//                        .param("minAmount", "10.0")
//                        .param("maxAmount", "100.0")
//                        .contentType(MediaType.APPLICATION_JSON))
//                .andExpect(status().isOk())
//                .andReturn();
//
//        // 验证响应内容和状态
//        assertThat(result.getResponse().getStatus()).isEqualTo(HttpStatus.OK.value());
//    }
//}