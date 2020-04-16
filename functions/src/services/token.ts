import { Device } from "../model/model";

// Bu metot user ın bütün device tokenlarını alır çoklanmış olanların tekilleştirir ve diğerlerinin indexlerini silinmek üzere ayırır.
export const findRepeatingElement = function (array: Device[]): any[][] {
    const temp: any = {};
    const deleteTokensIndexes: any[] = [];
    const inUseTokens: any[] = [];
    for (let i = 0; i < array.length; i++) {
        if (temp[array[i].token]) {
            deleteTokensIndexes.push(i);
        }
        temp[array[i].token] = true;
    }
    for (const k in temp) {
        inUseTokens.push(array.find(f => f.token === k));
    }
    return [inUseTokens, deleteTokensIndexes];
}