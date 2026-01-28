
import { GoogleGenAI } from '@google/genai';

const apiKey = "AIzaSyCe6GwVbs-mZlLj5VZu1Oh95IURrgQsunw";
const ai = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        const response = await ai.models.list();
        // response가 이터러블이거나 배열일 수 있음
        // 구조 확인을 위해 전체 출력
        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
