// Predictive Conversation Termination Advisor - JavaScript Implementation

class ConversationTerminationAdvisor {
    constructor() {
        this.conversation = [];
        this.conversationType = 'customer-support';
        this.completionScore = 0;
        this.efficiencyRating = 0;
        this.terminationThreshold = 75;
        this.isMonitoring = false;

        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.conversationContainer = document.getElementById('conversationContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendMessage');
        this.startButton = document.getElementById('startConversation');
        this.addMessageButton = document.getElementById('addMessage');
        this.conversationTypeSelect = document.getElementById('conversationType');

        this.statusIndicator = document.getElementById('statusIndicator');
        this.completionBar = document.getElementById('completionBar');
        this.completionValue = document.getElementById('completionValue');
        this.efficiencyBar = document.getElementById('efficiencyBar');
        this.efficiencyValue = document.getElementById('efficiencyValue');

        this.terminationSuggestions = document.getElementById('terminationSuggestions');
        this.suggestionContent = document.getElementById('suggestionContent');
        this.acceptButton = document.getElementById('acceptTermination');
        this.continueButton = document.getElementById('continueConversation');

        this.insightsContent = document.getElementById('insightsContent');
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.startNewConversation());
        this.addMessageButton.addEventListener('click', () => this.addSimulatedMessage());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.conversationTypeSelect.addEventListener('change', (e) => {
            this.conversationType = e.target.value;
        });
        this.acceptButton.addEventListener('click', () => this.acceptTermination());
        this.continueButton.addEventListener('click', () => this.continueConversation());
    }

    startNewConversation() {
        this.conversation = [];
        this.completionScore = 0;
        this.efficiencyRating = 100;
        this.isMonitoring = true;

        this.conversationContainer.innerHTML = '';
        this.messageInput.disabled = false;
        this.sendButton.disabled = false;

        this.updateAdvisorStatus('monitoring');
        this.updateMetrics();
        this.updateInsights();

        // Add initial bot message based on conversation type
        const initialMessage = this.getInitialMessage();
        this.addMessage('bot', initialMessage);
    }

    getInitialMessage() {
        const messages = {
            'customer-support': 'Hello! How can I help you with your inquiry today?',
            'sales': 'Hi there! I\'m interested in learning more about your needs. What brings you here?',
            'technical': 'Greetings! I\'m here to assist with any technical questions you might have.',
            'general': 'Hello! What would you like to talk about?'
        };
        return messages[this.conversationType] || messages['general'];
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.messageInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            const response = this.generateBotResponse(message);
            this.addMessage('bot', response);
            this.analyzeConversation();
        }, 1000 + Math.random() * 2000); // Random delay for realism
    }

    addSimulatedMessage() {
        const simulatedMessages = {
            'customer-support': [
                'I\'m having trouble with my account login.',
                'Can you help me reset my password?',
                'I need to update my billing information.',
                'When will my order arrive?',
                'I\'d like to cancel my subscription.'
            ],
            'sales': [
                'Tell me about your premium features.',
                'What are your pricing plans?',
                'Do you offer a free trial?',
                'Can you provide a demo?',
                'I\'m interested in enterprise solutions.'
            ],
            'technical': [
                'How do I configure the API?',
                'I\'m getting an error code 500.',
                'Can you explain the authentication flow?',
                'What are the system requirements?',
                'How do I troubleshoot connection issues?'
            ],
            'general': [
                'What\'s the weather like today?',
                'Can you recommend a good book?',
                'Tell me about your hobbies.',
                'What\'s your favorite programming language?',
                'Do you have any travel recommendations?'
            ]
        };

        const messages = simulatedMessages[this.conversationType] || simulatedMessages['general'];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        this.addMessage('user', randomMessage);

        setTimeout(() => {
            const response = this.generateBotResponse(randomMessage);
            this.addMessage('bot', response);
            this.analyzeConversation();
        }, 1000 + Math.random() * 2000);
    }

    addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = sender === 'user' ? 'U' : 'B';

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${content}</div>
        `;

        this.conversationContainer.appendChild(messageDiv);
        this.conversationContainer.scrollTop = this.conversationContainer.scrollHeight;

        this.conversation.push({ sender, content, timestamp: Date.now() });
    }

    generateBotResponse(userMessage) {
        // Simple response generation based on conversation type and message content
        const responses = {
            'customer-support': this.generateSupportResponse(userMessage),
            'sales': this.generateSalesResponse(userMessage),
            'technical': this.generateTechnicalResponse(userMessage),
            'general': this.generateGeneralResponse(userMessage)
        };

        return responses[this.conversationType] || responses['general'];
    }

    generateSupportResponse(message) {
        const responses = [
            'I understand your concern. Let me help you with that.',
            'I\'d be happy to assist you with your account issue.',
            'Let me check that for you right away.',
            'I can definitely help you resolve this.',
            'Thank you for bringing this to my attention.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateSalesResponse(message) {
        const responses = [
            'That\'s a great question! Let me tell you about our features.',
            'I\'d love to show you how our solution can benefit you.',
            'Our pricing is designed to be flexible for different needs.',
            'Would you like me to walk you through a demo?',
            'I\'m excited to help you find the right solution.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateTechnicalResponse(message) {
        const responses = [
            'Let me explain how that works step by step.',
            'I can help you troubleshoot this issue.',
            'Here\'s what you need to do to resolve that.',
            'Let me provide you with the technical details.',
            'I\'ll guide you through the configuration process.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateGeneralResponse(message) {
        const responses = [
            'That\'s interesting! Tell me more about that.',
            'I\'d love to hear your thoughts on this.',
            'That\'s a great point. What are your experiences?',
            'I\'m enjoying our conversation. What else is on your mind?',
            'Thanks for sharing that with me!'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    analyzeConversation() {
        if (!this.isMonitoring) return;

        this.calculateCompletionScore();
        this.calculateEfficiencyRating();
        this.updateMetrics();
        this.updateInsights();

        if (this.completionScore >= this.terminationThreshold) {
            this.suggestTermination();
        }
    }

    calculateCompletionScore() {
        let score = 0;

        // Analyze message patterns
        const userMessages = this.conversation.filter(msg => msg.sender === 'user');
        const botMessages = this.conversation.filter(msg => msg.sender === 'bot');

        // Completion indicators
        const completionKeywords = ['thank', 'thanks', 'resolved', 'solved', 'done', 'complete', 'understood', 'clear', 'perfect', 'great'];
        const userCompletionCount = userMessages.filter(msg =>
            completionKeywords.some(keyword => msg.content.toLowerCase().includes(keyword))
        ).length;

        // Bot confirmation patterns
        const confirmationPatterns = ['happy to help', 'resolved', 'assisted', 'completed', 'done'];
        const botConfirmationCount = botMessages.filter(msg =>
            confirmationPatterns.some(pattern => msg.content.toLowerCase().includes(pattern))
        ).length;

        // Conversation length factor
        const lengthScore = Math.min(50, this.conversation.length * 5);

        // Repetition detection (lower score for repetitive conversations)
        const uniqueMessages = new Set(this.conversation.map(msg => msg.content.toLowerCase()));
        const uniquenessScore = (uniqueMessages.size / this.conversation.length) * 30;

        score = lengthScore + (userCompletionCount * 10) + (botConfirmationCount * 15) + uniquenessScore;

        this.completionScore = Math.min(100, Math.max(0, score));
    }

    calculateEfficiencyRating() {
        // Efficiency decreases with conversation length and repetition
        const baseEfficiency = 100;
        const lengthPenalty = Math.max(0, this.conversation.length - 5) * 3;
        const repetitionPenalty = (1 - this.getMessageUniqueness()) * 20;

        this.efficiencyRating = Math.max(0, baseEfficiency - lengthPenalty - repetitionPenalty);
    }

    getMessageUniqueness() {
        const messages = this.conversation.map(msg => msg.content.toLowerCase());
        const uniqueMessages = new Set(messages);
        return uniqueMessages.size / messages.length;
    }

    updateMetrics() {
        this.completionBar.style.width = `${this.completionScore}%`;
        this.completionValue.textContent = `${Math.round(this.completionScore)}%`;

        this.efficiencyBar.style.width = `${this.efficiencyRating}%`;
        this.efficiencyValue.textContent = `${Math.round(this.efficiencyRating)}%`;
    }

    updateInsights() {
        const insights = [];

        if (this.conversation.length > 0) {
            insights.push(`Total messages: ${this.conversation.length}`);
            insights.push(`Conversation duration: ${this.getConversationDuration()} seconds`);
            insights.push(`Message uniqueness: ${Math.round(this.getMessageUniqueness() * 100)}%`);
        }

        if (this.completionScore > 50) {
            insights.push('Conversation appears to be approaching completion');
        }

        if (this.efficiencyRating < 70) {
            insights.push('Consider terminating to maintain efficiency');
        }

        this.insightsContent.innerHTML = insights.length > 0
            ? insights.map(insight => `<p>• ${insight}</p>`).join('')
            : '<p>No conversation data available yet.</p>';
    }

    getConversationDuration() {
        if (this.conversation.length < 2) return 0;
        const startTime = this.conversation[0].timestamp;
        const endTime = this.conversation[this.conversation.length - 1].timestamp;
        return Math.round((endTime - startTime) / 1000);
    }

    suggestTermination() {
        this.updateAdvisorStatus('suggesting');
        this.terminationSuggestions.style.display = 'block';

        const suggestions = this.getTerminationSuggestions();
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

        this.suggestionContent.innerHTML = `
            <p><strong>Suggested Response:</strong></p>
            <p class="suggested-message">"${randomSuggestion}"</p>
            <p><strong>Reason:</strong> Conversation completion score (${Math.round(this.completionScore)}%) indicates objectives may be fulfilled.</p>
        `;
    }

    getTerminationSuggestions() {
        const suggestions = {
            'customer-support': [
                'Is there anything else I can help you with today?',
                'I believe that resolves your issue. Let me know if you need further assistance.',
                'Thank you for contacting us. Your issue has been addressed.',
                'I hope this solution works for you. Please don\'t hesitate to reach out again.',
                'Your inquiry has been resolved. Have a great day!'
            ],
            'sales': [
                'Would you like to proceed with setting up your account?',
                'I can help you get started with our service right away.',
                'Thank you for your interest. Shall we move forward with the next steps?',
                'I believe I\'ve addressed your questions. Are you ready to make a decision?',
                'It\'s been great discussing our solutions with you. What are your next steps?'
            ],
            'technical': [
                'Does this resolve your technical question?',
                'I hope this explanation helps. Let me know if you need clarification.',
                'The issue should now be resolved. Please test and confirm.',
                'Thank you for bringing this to my attention. The solution is now in place.',
                'I believe we\'ve covered all the technical details. Any other questions?'
            ],
            'general': [
                'It\'s been great chatting with you!',
                'Thank you for the conversation. Have a wonderful day!',
                'I enjoyed our discussion. Until next time!',
                'That covers everything we discussed. Take care!',
                'Thanks for sharing your thoughts. Have a great day!'
            ]
        };

        return suggestions[this.conversationType] || suggestions['general'];
    }

    acceptTermination() {
        this.addMessage('bot', this.suggestionContent.querySelector('.suggested-message').textContent.slice(1, -1));
        this.endConversation();
    }

    continueConversation() {
        this.terminationSuggestions.style.display = 'none';
        this.updateAdvisorStatus('monitoring');
    }

    endConversation() {
        this.isMonitoring = false;
        this.messageInput.disabled = true;
        this.sendButton.disabled = true;
        this.terminationSuggestions.style.display = 'none';
        this.updateAdvisorStatus('completed');

        setTimeout(() => {
            this.addMessage('system', 'Conversation terminated for efficiency. Final metrics: Completion ' +
                Math.round(this.completionScore) + '%, Efficiency ' + Math.round(this.efficiencyRating) + '%');
        }, 1000);
    }

    updateAdvisorStatus(status) {
        const statusText = {
            'monitoring': 'Monitoring conversation...',
            'suggesting': 'Termination suggested',
            'completed': 'Conversation completed'
        };

        this.statusIndicator.className = `status-indicator ${status}`;
        this.statusIndicator.querySelector('span').textContent = statusText[status] || statusText['monitoring'];
    }
}

// Initialize the advisor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ConversationTerminationAdvisor();
});