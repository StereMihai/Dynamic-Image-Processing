import { promises as fs} from 'fs'

export const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
        await fs.access(filePath, fs.constants.F_OK);
        return true;
    } catch (error) {
       console.error("File does not exists");
       return false;
    }
}