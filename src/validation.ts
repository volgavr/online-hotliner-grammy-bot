import { PhotoSize, Video } from "grammy/types";
import { DESCRIPTION_MAX_LENGTH, DESCRIPTION_MIN_LENGTH, IMAGE_MIN_HEIGHT, IMAGE_MIN_WIDTH, SERIAL_NUMBER_MAX_LENGTH, TITLE_MAX_LENGTH, TITLE_MIN_LENGTH, VIDEO_MAX_DURATION, VIDEO_MAX_FILESIZE } from "./consts";

type ValidationDataType = 'email' | 'serial' | 'title' | 'description' | 'phone-number' | 'one-time-code';

interface IValidationResult<T> {
    passed: boolean;
    message?: string;
    output: T; 
}

export function validate(dataType: ValidationDataType, input: string) {
    switch(dataType) {
        case 'email':
            return validateEmail(input);
        case 'serial':
            return validateSerial(input);
        case 'title':
            return validateTitle(input);
        case 'description':
            return validateDescription(input);
        case 'phone-number':
            return validatePhoneNumber(input);
        case 'one-time-code':
            return validateOneTimeCode(input);
    }
}

function validateEmail(input: string): IValidationResult<string> {
    const isValid = /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i.test(input);
    return {
        passed: isValid,
        message: "Недопустимый адрес",
        output: isValid ? input.toLowerCase() : input
    }
}

function validateTitle(input: string): IValidationResult<string> {
    const isValid = !!input && input.length >= TITLE_MIN_LENGTH;
    return {
        passed: isValid,
        message: !isValid ? `Слишком короткое описание. Требуется минимум ${TITLE_MIN_LENGTH} знаков.` : "",
        output: isValid ? input.substring(0, TITLE_MAX_LENGTH) : input
    }
}

function validateSerial(input: string): IValidationResult<string> {
    const isValid = input == '-' || input.length <= SERIAL_NUMBER_MAX_LENGTH && /^([A-z0-9-]+\s?)+$/.test(input);
    return {
        passed: isValid,
        message: !isValid ? `Серийный номер должен состоять из букв, цифр, дефиса и содержать до ${SERIAL_NUMBER_MAX_LENGTH} знаков.` : "",
        output: isValid ? input.trim() : input
    }
}

function validateDescription(input: string): IValidationResult<string> {
    const isValid = !!input && input.length >= DESCRIPTION_MIN_LENGTH;
    return {
        passed: isValid,
        message: !isValid ? `Слишком короткое описание. Требуется минимум ${DESCRIPTION_MIN_LENGTH} знаков.` : "",
        output: isValid ? input.substring(0, DESCRIPTION_MAX_LENGTH) : input
    }
}

function validateOneTimeCode(input: string): IValidationResult<string> {
    const isValid = /^[0-9]{1,6}$/.test(input);
    return {
        passed: isValid,
        message: !isValid ? "Код состоит из цифр (до 6 цифр)." : "",
        output: input
    }
}
function validatePhoneNumber(input: string): IValidationResult<string> {
    const output = input.replace(/[-\s()]/, '');
    const isValid = /^\+?7[0-9]{10}$/.test(output);
    return {
        passed: isValid,
        message: "Недопустимый номер",
        output: isValid ? output : input 
    }
}

export function validatePhotoSize(photo: PhotoSize): IValidationResult<PhotoSize> {
    const isValid = photo.width >= IMAGE_MIN_WIDTH && photo.height >= IMAGE_MIN_HEIGHT;
    return {
        passed: isValid,
        message: !isValid ? `Минимальный размер изображения должен быть ${IMAGE_MIN_WIDTH} x ${IMAGE_MIN_HEIGHT}` : "",
        output: photo
    }
}

export function validateVideo(video: Video): IValidationResult<Video> {
    const result = {
        passed: false,
        message: "",
        output: video
    };

    if(video.duration > VIDEO_MAX_DURATION) {
        result.message = `Я принимаю видео длительностью до ${(VIDEO_MAX_DURATION/60).toFixed(2)} мин.`;
        return result;    
    }

    if (video.file_size && video.file_size > VIDEO_MAX_FILESIZE) {
        result.message = `Размер видео слишком велик. Я принимаю до ${(VIDEO_MAX_FILESIZE / (1 << 20)).toFixed(0)} Мбайт.`;
        return result;
    }

    result.passed = true;
    return result;
}