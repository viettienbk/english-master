"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const vocabularyData = require('./vocabulary.json');
const extraVocabularyData = require('./extra_vocabulary.json');
const oxford3000Data = require('./oxford_3000.json');
const oxford3000Batch2Data = require('./oxford_3000_batch2.json');
const oxford3000Batch3Data = require('./oxford_3000_batch3.json');
const oxford3000Batch4Data = require('./oxford_3000_batch4.json');
const oxford3000Batch5Data = require('./oxford_3000_batch5.json');
const oxford3000Batch6Data = require('./oxford_3000_batch6.json');
const moreListeningData = require('./more_listening.json');
const moreGrammarData = require('./more_grammar.json');
const grammarData = require('./grammar.json');
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.word.deleteMany();
    await prisma.vocabularyTopic.deleteMany();
    await prisma.listeningLesson.deleteMany();
    await prisma.grammarLesson.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.create({
        data: {
            id: 'user_123',
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        },
    });
    console.log('Created test user: user_123');
    const mergedVocabulary = [...vocabularyData];
    const allExtraData = [
        ...extraVocabularyData,
        ...oxford3000Data,
        ...oxford3000Batch2Data,
        ...oxford3000Batch3Data,
        ...oxford3000Batch4Data,
        ...oxford3000Batch5Data,
        ...oxford3000Batch6Data,
    ];
    for (const extraTopic of allExtraData) {
        const existingTopic = mergedVocabulary.find((t) => t.name === extraTopic.name);
        if (existingTopic) {
            const existingWordTexts = new Set(existingTopic.words.map((w) => w.word.toLowerCase()));
            const newWords = extraTopic.words.filter((w) => !existingWordTexts.has(w.word.toLowerCase()));
            existingTopic.words = [...existingTopic.words, ...newWords];
        }
        else {
            mergedVocabulary.push(extraTopic);
        }
    }
    for (const topic of mergedVocabulary) {
        const { words, ...topicData } = topic;
        const createdTopic = await prisma.vocabularyTopic.create({
            data: {
                ...topicData,
                words: {
                    create: words,
                },
            },
        });
        console.log(`Created topic: ${createdTopic.name} with ${words.length} words`);
    }
    const allGrammar = [...grammarData, ...moreGrammarData];
    for (const lesson of allGrammar) {
        const created = await prisma.grammarLesson.create({
            data: {
                ...lesson,
                examples: typeof lesson.examples === 'string' ? lesson.examples : JSON.stringify(lesson.examples),
                exercises: typeof lesson.exercises === 'string' ? lesson.exercises : JSON.stringify(lesson.exercises),
            },
        });
        console.log(`Created grammar lesson: ${created.title}`);
    }
    const listeningLessons = [
        {
            title: 'At the Airport',
            titleVi: 'Tại sân bay',
            level: 'beginner',
            audioUrl: '/audio/at-the-airport.mp3',
            transcript: 'Good morning. Welcome to the check-in counter. May I see your passport and boarding pass please? Here you go. Thank you. Are you checking any luggage today? Yes, I have one suitcase. Please place it on the scale. Your flight to London departs from gate B12 at 3 PM. Have a nice flight!',
            blanks: JSON.stringify([
                { position: 0, answer: 'passport', hint: 'An official travel document' },
                { position: 1, answer: 'luggage', hint: 'Bags for traveling' },
                { position: 2, answer: 'suitcase', hint: 'A type of bag with a handle' },
                { position: 3, answer: 'gate', hint: 'Where you board the plane' },
                { position: 4, answer: 'flight', hint: 'A journey by airplane' },
            ]),
            translation: 'Chào buổi sáng. Chào mừng đến quầy check-in. Tôi có thể xem hộ chiếu và thẻ lên máy bay của bạn không? Đây ạ. Cảm ơn. Bạn có gửi hành lý nào hôm nay không? Vâng, tôi có một vali. Vui lòng đặt lên cân. Chuyến bay của bạn đến London khởi hành từ cửa B12 lúc 3 giờ chiều. Chúc bạn chuyến bay vui vẻ!',
            order: 1,
        },
        {
            title: 'Ordering at a Restaurant',
            titleVi: 'Gọi món tại nhà hàng',
            level: 'beginner',
            audioUrl: '/audio/ordering-restaurant.mp3',
            transcript: 'Good evening. Welcome to The Garden Restaurant. A table for two please. Right this way. Here are your menus. Can I get you something to drink? I will have a glass of water and she will have orange juice. Are you ready to order? Yes, I would like the grilled chicken and she will have the pasta. Excellent choice!',
            blanks: JSON.stringify([
                { position: 0, answer: 'table', hint: 'Where you sit to eat' },
                { position: 1, answer: 'menus', hint: 'List of food and drinks' },
                { position: 2, answer: 'drink', hint: 'Beverage' },
                { position: 3, answer: 'order', hint: 'To request food' },
                { position: 4, answer: 'grilled', hint: 'Cooked over fire' },
            ]),
            translation: 'Chào buổi tối. Chào mừng đến nhà hàng The Garden. Cho hai người một bàn. Mời đi lối này. Đây là thực đơn. Tôi có thể lấy cho bạn gì để uống? Tôi sẽ lấy một ly nước và cô ấy sẽ lấy nước cam. Bạn sẵn sàng gọi món chưa? Vâng, tôi muốn gà nướng và cô ấy sẽ lấy mì ý. Lựa chọn tuyệt vời!',
            order: 2,
        },
        {
            title: 'At the Doctor',
            titleVi: 'Tại phòng khám',
            level: 'intermediate',
            audioUrl: '/audio/at-the-doctor.mp3',
            transcript: 'Hello doctor. What seems to be the problem? I have been feeling very tired lately and I have a headache that will not go away. How long have you had these symptoms? For about a week now. Let me check your temperature and blood pressure. Your temperature is slightly high. I am going to prescribe some medicine for you. Take it twice a day after meals.',
            blanks: JSON.stringify([
                { position: 0, answer: 'tired', hint: 'Feeling exhausted' },
                { position: 1, answer: 'headache', hint: 'Pain in the head' },
                { position: 2, answer: 'symptoms', hint: 'Signs of illness' },
                { position: 3, answer: 'temperature', hint: 'Body heat measurement' },
                { position: 4, answer: 'prescribe', hint: 'To give a medical order' },
            ]),
            translation: 'Xin chào bác sĩ. Có vấn đề gì vậy? Gần đây tôi cảm thấy rất mệt và tôi bị đau đầu không dứt. Bạn bị những triệu chứng này bao lâu rồi? Khoảng một tuần nay. Để tôi kiểm tra nhiệt độ và huyết áp. Nhiệt độ của bạn hơi cao. Tôi sẽ kê đơn thuốc cho bạn. Uống hai lần một ngày sau bữa ăn.',
            order: 3,
        },
        ...moreListeningData,
    ];
    for (const lesson of listeningLessons) {
        const created = await prisma.listeningLesson.create({
            data: {
                ...lesson,
                blanks: typeof lesson.blanks === 'string' ? lesson.blanks : JSON.stringify(lesson.blanks),
            },
        });
        console.log(`Created listening lesson: ${created.title}`);
    }
    console.log('Seeding completed!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map