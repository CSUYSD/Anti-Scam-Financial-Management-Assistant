package com.example.demo.utility;

import org.springframework.stereotype.Component;

@Component
public class PromptManager {

    private static final String RAG_CONTEXT_TEMPLATE = """
        Below is the context information (user's financial history):
        ---------------------
        {question_answer_context}
        ---------------------
    """;

    private static final String FINANCIAL_REPORT_TEMPLATE = """
        As the user's personal financial advisor, review the following recent transaction records and the user's financial history:
        
        %s
        
        Provide a personalized financial summary addressing the user directly, adhering to these guidelines:
        1. Use a warm, conversational tone as if speaking directly to the user.
        2. Synthesize information from both the recent transaction records and the user's financial history in the context.
        3. Do NOT format the response as a letter, email, or formal written communication.
        4. Avoid salutations like "Dear" or closings like "Warm regards."
        5. Limit the response to 300 English words or less.
        6. Format the entire response in well-structured Markdown.
        
        Your report should include:
        1. A friendly introduction summarizing their current financial status.
        2. Key observations from their recent records and historical data.
        3. Potential areas of concern or improvement, expressed with care.
        4. Personalized financial recommendations (avoid specific investment advice).
        
        This is an example of response:
        ```
            # Hello, John Doe! Here's your financial summary
            
            I hope you're doing well! Based on your recent financial records, there are a few key observations I'd like to share with you, along with some suggestions to help you manage your finances more effectively.
            
            ## Key Observations
            
            - **Spending Trends**: Your recent expenses indicate higher spending on dining out, which exceeds your usual monthly budget by 20%%. This may impact your savings goals if continued.
            - **Savings Contributions**: Your monthly savings contribution rate is currently at 10%%. Given your goal of purchasing a home, increasing this rate might accelerate your progress.
            - **Debt Management**: You have an outstanding balance on your credit card, which is incurring interest. Addressing this sooner could help you save on interest costs.
            
            ## Areas for Improvement
            
            To improve your financial situation, it might be helpful to revisit your budget for discretionary spending. Balancing your current lifestyle while planning for future goals will help you stay on track.
            
            ## Financial Recommendations
            
            - **Increase Savings Rate**: Consider adjusting your monthly savings contributions from 10%% to 15%%, especially to align with your long-term goals.
            - **Debt Repayment Plan**: Prioritize paying down high-interest debts like your credit card. Even small additional payments can significantly reduce your interest burden over time.
            - **Track Spending**: Utilizing a budgeting app can help manage discretionary spending. This could make it easier to stay within your planned limits and adjust when necessary.
            
            With these small adjustments, you can make gradual improvements to your financial health. If you have any questions or need further support, feel free to reach out! Together, we can work towards achieving your financial goals.
        ```
        """;

    public String getRAGPromptTemplate() {
        return RAG_CONTEXT_TEMPLATE;
    }

    public String getFinancialReportPrompt(String recentRecords) {
        return String.format(FINANCIAL_REPORT_TEMPLATE, recentRecords);
    }
}

