"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const prisma_service_1 = require("../prisma/prisma.service");
const TOPICS = [
    { id: 'travel', name: 'Du lịch & Sân bay', nameEn: 'Travel & Airport', scenario: 'You are at an airport checking in for a flight to London. The AI plays the check-in staff.' },
    { id: 'restaurant', name: 'Nhà hàng', nameEn: 'Restaurant', scenario: 'You are ordering food at a restaurant. The AI plays the waiter.' },
    { id: 'shopping', name: 'Mua sắm', nameEn: 'Shopping', scenario: 'You are at a clothing store looking for a gift for your friend. The AI plays the shop assistant.' },
    { id: 'job_interview', name: 'Phỏng vấn xin việc', nameEn: 'Job Interview', scenario: 'You are being interviewed for a marketing manager position at a tech company. The AI plays the interviewer.' },
    { id: 'doctor', name: 'Khám bệnh', nameEn: 'Doctor Visit', scenario: 'You are visiting a doctor about a headache and fever you have had for 2 days. The AI plays the doctor.' },
    { id: 'daily_chat', name: 'Trò chuyện hàng ngày', nameEn: 'Daily Chat', scenario: 'You are chatting with a new colleague during a coffee break at work. The AI plays the colleague.' },
    { id: 'hotel', name: 'Đặt phòng khách sạn', nameEn: 'Hotel Check-in', scenario: 'You are checking into a hotel. You have a reservation but want to request a room upgrade. The AI plays the hotel receptionist.' },
    { id: 'bank', name: 'Giao dịch ngân hàng', nameEn: 'At the Bank', scenario: 'You are at a bank wanting to open a savings account and ask about exchange rates. The AI plays the bank teller.' },
    { id: 'apartment', name: 'Thuê căn hộ', nameEn: 'Apartment Hunting', scenario: 'You are calling about a rental apartment listing you saw online. You want to know the details, price, and arrange a viewing. The AI plays the landlord.' },
    { id: 'phone_support', name: 'Hỗ trợ khách hàng', nameEn: 'Customer Support', scenario: 'You are calling customer service because your internet has been down for 2 days. The AI plays the customer support agent.' },
    { id: 'making_plans', name: 'Hẹn gặp bạn bè', nameEn: 'Making Plans', scenario: 'You are calling your friend to make plans for the weekend – suggest activities and agree on a time and place. The AI plays your friend.' },
    { id: 'gym', name: 'Đăng ký phòng gym', nameEn: 'At the Gym', scenario: 'You are at a gym inquiring about membership plans, facilities, and personal training options. The AI plays the gym receptionist.' },
    { id: 'business_meeting', name: 'Cuộc họp kinh doanh', nameEn: 'Business Meeting', scenario: 'You are presenting a new product idea in a business meeting and need to convince your manager. The AI plays your manager.' },
    { id: 'complaint', name: 'Khiếu nại dịch vụ', nameEn: 'Making a Complaint', scenario: 'You ordered food online but received the wrong order. You are calling the restaurant to complain and request a refund. The AI plays the restaurant manager.' },
    { id: 'directions', name: 'Hỏi đường', nameEn: 'Asking for Directions', scenario: 'You are lost in a city and need to find the nearest metro station and a pharmacy. The AI plays a local resident.' },
    { id: 'school', name: 'Môi trường học đường', nameEn: 'School / University', scenario: 'You are a student meeting your professor to discuss your thesis topic and ask for guidance. The AI plays the professor.' },
    { id: 'social_event', name: 'Sự kiện xã hội', nameEn: 'Social Event', scenario: 'You are at a networking event and meeting new people. You need to introduce yourself, your job, and make small talk. The AI plays other attendees.' },
    { id: 'emergency', name: 'Tình huống khẩn cấp', nameEn: 'Emergency Situation', scenario: 'You witnessed a car accident and are calling 911/emergency services to report it and describe the situation. The AI plays the emergency operator.' },
    { id: 'pharmacy', name: 'Hiệu thuốc', nameEn: 'At the Pharmacy', scenario: 'You are at a pharmacy picking up a prescription and asking the pharmacist about side effects and dosage instructions. The AI plays the pharmacist.' },
    { id: 'job_resignation', name: 'Thôi việc', nameEn: 'Resignation Meeting', scenario: 'You are meeting your manager to resign professionally. You need to give 2 weeks notice and discuss the handover. The AI plays your manager.' },
    { id: 'car_rental', name: 'Thuê xe ô tô', nameEn: 'Car Rental', scenario: 'You are at a car rental agency looking to rent an SUV for a weekend road trip. The AI plays the rental agent.' },
    { id: 'haircut', name: 'Cắt tóc', nameEn: 'At the Hair Salon', scenario: 'You are at a hair salon describing the new haircut and style you want. The AI plays the hair stylist.' },
    { id: 'coffee_shop', name: 'Quán cà phê', nameEn: 'Coffee Shop', scenario: 'You are at a busy cafe ordering a customized coffee and a snack. The AI plays the barista.' },
    { id: 'real_estate', name: 'Mua nhà', nameEn: 'Real Estate Inquiry', scenario: 'You are interested in buying a house and are asking a real estate agent about the neighborhood, price, and financing. The AI plays the real estate agent.' },
    { id: 'lost_property', name: 'Thất lạc đồ đạc', nameEn: 'Lost and Found', scenario: 'You lost your bag on a train and are reporting it at the station office. The AI plays the station officer.' },
    { id: 'tech_support', name: 'Hỗ trợ kỹ thuật', nameEn: 'Tech Support', scenario: 'You are calling IT support because your laptop is running slow and won\'t connect to the printer. The AI plays the IT technician.' },
    { id: 'travel_agency', name: 'Đại lý du lịch', nameEn: 'Travel Agency', scenario: 'You are planning a honeymoon trip to Japan and asking for package deals and recommendations. The AI plays the travel consultant.' },
    { id: 'library', name: 'Thư viện', nameEn: 'At the Library', scenario: 'You are looking for specific research books and asking about membership rules. The AI plays the librarian.' },
    { id: 'wedding_planning', name: 'Lên kế hoạch đám cưới', nameEn: 'Wedding Planning', scenario: 'You are meeting a wedding planner to discuss the venue, theme, and budget. The AI plays the wedding planner.' },
    { id: 'pet_adoption', name: 'Nhận nuôi thú cưng', nameEn: 'Pet Adoption', scenario: 'You are at an animal shelter looking to adopt a dog and asking about their history and needs. The AI plays the shelter worker.' },
    { id: 'museum_tour', name: 'Tham quan bảo tàng', nameEn: 'Museum Visit', scenario: 'You are at an art museum asking about specific exhibitions and audio guides. The AI plays the museum guide.' },
    { id: 'ordering_pizza', name: 'Đặt Pizza', nameEn: 'Ordering Pizza', scenario: 'You are calling to order two pizzas with specific toppings and delivery instructions. The AI plays the pizza shop employee.' },
    { id: 'post_office', name: 'Bưu điện', nameEn: 'At the Post Office', scenario: 'You are sending a fragile package abroad and asking about shipping rates and insurance. The AI plays the post office clerk.' },
    { id: 'car_accident', name: 'Tai nạn xe cộ', nameEn: 'Car Accident Exchange', scenario: 'You had a minor fender bender and are exchanging insurance information with the other driver. The AI plays the other driver.' },
    { id: 'job_offer_negotiation', name: 'Thỏa thuận lương', nameEn: 'Job Offer Negotiation', scenario: 'You received a job offer and are negotiating the salary and benefits. The AI plays the HR manager.' },
    { id: 'buying_a_gift', name: 'Mua quà tặng', nameEn: 'Buying a Gift', scenario: 'You are at a boutique looking for a birthday gift for your mother and asking for suggestions. The AI plays the shopkeeper.' },
    { id: 'returning_item', name: 'Trả lại hàng', nameEn: 'Returning an Item', scenario: 'You are returning a defective electronic gadget you bought last week. The AI plays the customer service representative.' },
    { id: 'renting_a_bike', name: 'Thuê xe đạp', nameEn: 'Renting a Bike', scenario: 'You are renting a bike for a day to explore the park and asking about safety gear. The AI plays the rental shop worker.' },
    { id: 'checking_in_airport', name: 'Check-in tại sân bay', nameEn: 'Airport Check-in', scenario: 'You are at the check-in counter, your bag is overweight, and you are trying to resolve the issue. The AI plays the check-in agent.' },
    { id: 'ordering_at_bar', name: 'Gọi đồ tại quầy bar', nameEn: 'Ordering at a Bar', scenario: 'You are at a bar ordering drinks and chatting briefly with the bartender. The AI plays the bartender.' },
    { id: 'fitness_class', name: 'Lớp học thể dục', nameEn: 'Fitness Class Inquiry', scenario: 'You are asking about different fitness classes (yoga, pilates, HIIT) at a local community center. The AI plays the receptionist.' },
    { id: 'neighbor_introduction', name: 'Làm quen hàng xóm', nameEn: 'Meeting a Neighbor', scenario: 'You just moved in and are introducing yourself to your next-door neighbor. The AI plays the neighbor.' },
    { id: 'dentist_visit', name: 'Khám răng', nameEn: 'At the Dentist', scenario: 'You are at the dentist for a regular check-up and describing a toothache. The AI plays the dentist.' },
    { id: 'bookstore', name: 'Nhà sách', nameEn: 'At the Bookstore', scenario: 'You are looking for a best-selling novel and asking for recommendations in the mystery genre. The AI plays the bookstore clerk.' },
    { id: 'cinema', name: 'Rạp chiếu phim', nameEn: 'At the Cinema', scenario: 'You are buying tickets for a 3D movie and asking about student discounts. The AI plays the ticket seller.' },
    { id: 'gas_station', name: 'Trạm xăng', nameEn: 'At the Gas Station', scenario: 'You are at a gas station, having trouble with the pump and asking for help. The AI plays the attendant.' },
    { id: 'asking_for_promotion', name: 'Yêu cầu thăng chức', nameEn: 'Asking for a Promotion', scenario: 'You are meeting your boss to discuss your performance and ask for a promotion. The AI plays your boss.' },
    { id: 'breaking_bad_news', name: 'Thông báo tin buồn', nameEn: 'Breaking Bad News', scenario: 'You have to tell your friend that you accidentally broke their expensive camera. The AI plays your friend.' },
    { id: 'planning_a_party', name: 'Lên kế hoạch tiệc tùng', nameEn: 'Planning a Surprise Party', scenario: 'You are planning a surprise birthday party for a mutual friend and discussing details. The AI plays your co-conspirator.' },
    { id: 'taxi_ride', name: 'Đi taxi', nameEn: 'In a Taxi', scenario: 'You are in a taxi, giving directions and asking about the estimated arrival time. The AI plays the taxi driver.' },
    { id: 'immigration_officer', name: 'Thủ tục nhập cảnh', nameEn: 'At Immigration', scenario: 'You are at the airport immigration counter answering questions about your stay. The AI plays the immigration officer.' },
];
let ConversationService = class ConversationService {
    prisma;
    genAI;
    constructor(prisma) {
        this.prisma = prisma;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    getTopics() {
        return TOPICS;
    }
    buildSystemPrompt(scenario) {
        return `You are an English conversation practice partner.
The scenario is: "${scenario}"
Your role: Play the other person in this scenario (e.g., airline staff, waiter, interviewer).

Rules:
- Speak naturally but clearly at a pace suitable for English learners
- Keep your response concise (2-4 sentences max)
- Respond in English only
- If the user makes a grammar mistake, briefly correct it at the end (e.g. "💬 Correction: ...")
- ALWAYS end every single response with exactly 3 suggested phrases the learner could say next, formatted as:
💡 Suggested:
- [phrase 1]
- [phrase 2]
- [phrase 3]`;
    }
    async startConversation(topicId, userId) {
        const topic = TOPICS.find((t) => t.id === topicId);
        if (!topic)
            throw new Error('Topic not found');
        const conversation = await this.prisma.conversation.create({
            data: {
                userId: userId || null,
                topic: topicId,
                scenario: topic.scenario,
            },
        });
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: this.buildSystemPrompt(topic.scenario),
        });
        const result = await model.generateContent('Start the conversation naturally as the person in the scenario. Greet the user and begin the interaction. Then provide 3 suggested phrases the user could say to respond.');
        const aiContent = result.response.text();
        await this.prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: aiContent,
            },
        });
        return { conversation, message: aiContent };
    }
    async sendMessage(conversationId, userMessage) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!conversation)
            throw new Error('Conversation not found');
        const topic = TOPICS.find((t) => t.id === conversation.topic);
        const scenario = conversation.scenario || topic?.scenario || '';
        await this.prisma.message.create({
            data: { conversationId, role: 'user', content: userMessage },
        });
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: this.buildSystemPrompt(scenario),
            generationConfig: { temperature: 0.8 },
        });
        const history = conversation.messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessage);
        const aiContent = result.response.text();
        await this.prisma.message.create({
            data: { conversationId, role: 'assistant', content: aiContent },
        });
        return { message: aiContent };
    }
    async getConversation(id) {
        return this.prisma.conversation.findUnique({
            where: { id },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map