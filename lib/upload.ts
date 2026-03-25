import { uploadBase64ToGridFS, uploadFileToGridFS } from "./gridfs";

export async function saveFile(file: File, subfolder: string = ""): Promise<string> {
    return uploadFileToGridFS(file, subfolder);
}

export async function saveBase64Image(base64: string, subfolder: string = ""): Promise<string> {
    return uploadBase64ToGridFS(base64, subfolder);
}

export async function saveBase64Media(base64: string, subfolder: string = ""): Promise<string> {
    return uploadBase64ToGridFS(base64, subfolder);
}
