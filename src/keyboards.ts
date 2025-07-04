import { InlineKeyboard, Keyboard } from "grammy";
import { CANNOT_GET_SMS_CODE_TEXT, NO_MORE_PHOTO_TEXT, SHARE_MY_FIRST_NAME_TEXT, SHARE_MY_PHONE_NUMBER_TEXT } from "./consts";

// Build an inline keyboard:
export const equipmentTypeKeyboard = new InlineKeyboard()
    .text('Автосканер', 'equip_1')
    .text('Автоподъемник', 'equip_3').row()
    .text('Станция для заправки А/С', 'equip_2').row()
    .text('Стенд сход-развала', 'equip_4').row()
    .text('Шиномонтажное оборудование', 'equip_5').row()
    .text('Дизельное оборудование', 'equip_6');


export const equipmentBrandKeyboard = new InlineKeyboard()
    .text('THINKCAR', 'brand_thinkcar')
    .text('FCAR', 'brand_fcar').row()
    .text('TEXA', 'brand_texa')
    .text('ETRA', 'brand_etra').row()
    .text('ПОТОК', 'brand_potok');

export const continueBtnKeyboard = new Keyboard()
    .text(NO_MORE_PHOTO_TEXT).resized();

export const shareMyPhoneNumberKeyboard = new Keyboard()
    .requestContact(SHARE_MY_PHONE_NUMBER_TEXT).resized().oneTime();

export const shareMyFirstNameKeyboard = new Keyboard()
    .text(SHARE_MY_FIRST_NAME_TEXT).resized().oneTime();

export const haventGotConfirmationCodeKeyboard = new Keyboard()
    .text(CANNOT_GET_SMS_CODE_TEXT).resized().oneTime();
