
import { GoogleGenAI } from '@google/genai';

const apiKey = "AIzaSyCe6GwVbs-mZlLj5VZu1Oh95IURrgQsunw";
const ai = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        const response = await ai.models.list();
        console.log("Available Models:");
        // response.models가 배열인지 확인 필요, SDK 버전에 따라 다를 수 있음
        // @google/genai 1.x는 .models.list()가 무엇을 반환하는지 확인
        // 보통 { models: [] } 형태임

        // SDK 문서나 타입을 볼 수 없으니 일단 통째로 출력
        console.log(JSON.stringify(response, null, 2));

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
