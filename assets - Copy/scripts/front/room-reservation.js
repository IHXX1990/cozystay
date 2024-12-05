
(function ($) {
"use strict";
var $reservationForm, $ihxxServices, priceList, $totalPrice, defaultCheckoutDate, defaultCheckoutTimeStamp, ihxxServiceTotalPrice, roomTotalPrice,
adultTotalPrice, childTotalPrice, $checkinDate, $checkoutDate, $roomNumber, $adultNumber, $childNumber, $roomMessage, $errorMessage, $successMessage,
checkinDate, checkoutDate, roomNumber, adultNumber, childNumber, checkinTimestamp, checkoutTimestamp, dayTime = 86400, roomID, i18nText,
discounts = false, hasFlexibilePriceRules = false, $loading, $priceDetails, $basePrice, originalTotalPrice, discountBasePrice, finalRoomTotalPrice,
priceDetailsTmpl, ihxxServiceListTmpl, $availabilityCalendar, todayTimestamp, disabledStartDates = [], disabledEndDates = [], dateFormat = 'YYYY-MM-DD',
hasihxxServices, hasCustomihxxServices, $totalPriceSection, hasAvailabilityCalendar, messageTimer = false;

function updateLowestPrice() {
var lowest = false, originalLowest = false;
for (var i = checkinTimestamp; i < checkoutTimestamp; i += dayTime) {
if (priceList[i] && ('available' == priceList[i]['status'])) {
var currentActualPrice, currentOriginalPrice = loftoceanRoomReservation.pricePerPerson
? add(multiplication(priceList[i]['adult_price'], adultNumber), multiplication(childNumber, priceList[i]['child_price']))
: priceList[i]['price'];

currentActualPrice = priceList[i]['special_price_rate'] ? multiplication(currentOriginalPrice, priceList[i]['special_price_rate']) : currentOriginalPrice;

if ((false === lowest) || (Number(currentActualPrice) < Number(lowest))) {
lowest = currentActualPrice;
}
if ((false === originalLowest) || (Number(currentOriginalPrice) < Number(originalLowest))) {
originalLowest = currentOriginalPrice;
}
}
}
if (false !== lowest) {
var currentBasePrice = '';
if (originalLowest > lowest) {
currentBasePrice = '<del>' + checkOutputNumberFormat(originalLowest) + '</del> <span class="sale">' + checkOutputNumberFormat(lowest) + '</span>';
} else {
currentBasePrice = checkOutputNumberFormat(lowest);
}
$basePrice.html(currentBasePrice);
}
}
function updateRoomMessage() {
if (!$roomMessage.length) return;

var lowest = false, failed = false;
clearTimeout(messageTimer);
$roomMessage.removeClass('show');
$roomNumber.removeData('max');
for (var i = checkinTimestamp; i < checkoutTimestamp; i += dayTime) {
if (priceList[i] && ('available' == priceList[i]['status']) && (! !priceList[i]['available_number'])) {
if ((false === lowest) || (Number(priceList[i]['available_number']) < lowest)) {
lowest = Number(priceList[i]['available_number']);
}
} else {
failed = true;
break;
}
}
if ((!failed) && (false !== lowest) && (lowest > 0)) {
$roomNumber.data('max', lowest);
if (roomNumber > lowest) {
$roomMessage.find('.room-error-limit-number').text(lowest);
$roomNumber.val(lowest - 1).siblings('.plus').trigger('click');
$roomMessage.addClass('show');
messageTimer = setTimeout(function () { $roomMessage.removeClass('show'); }, 3000);
}
}
}
function updatePriceDetails() {
var roomList = [], totalPrice = add(finalRoomTotalPrice, ihxxServiceTotalPrice),
data = {
'totalBasePrice': checkOutputNumberFormat(originalTotalPrice, true),
'nights': (checkoutTimestamp - checkinTimestamp) / dayTime,
'totalPrice': checkOutputNumberFormat(totalPrice, true),
'totalOriginalPrice': totalPrice
};
if (ihxxServiceTotalPrice) {
data.ihxxService = checkOutputNumberFormat(ihxxServiceTotalPrice, true);
}
if ((false !== discounts) && discounts['discount']['base_percentage']) {
Object.keys(discounts['discount']['details']).forEach(function (key) {
var discountItem = discounts['discount']['details'][key];
data[key] = ('-' + checkOutputNumberFormat(multiplication(originalTotalPrice, discountItem['discount'])));
});
}

for (var i = checkinTimestamp; i < checkoutTimestamp; i += dayTime) {
if (priceList[i]) {
if ('available' == priceList[i]['status']) {
var rate = priceList[i]['special_price_rate'] ? priceList[i]['special_price_rate'] : 1,
originalPrice = loftoceanRoomReservation.pricePerPerson
? add(multiplication(priceList[i]['adult_price'], adultNumber), multiplication(priceList[i]['child_price'], childNumber))
: multiplication(priceList[i]['price'], roomNumber);
roomList.push({
'date': priceList[i]['start'],
'originalPrice': checkOutputNumberFormat(originalPrice, true),
'price': checkOutputNumberFormat(multiplication(originalPrice, rate), true)
});
} else {
roomList.push({
'date': priceList[i]['start'],
'price': false
});
}
}
}
data.rooms = roomList;
checkTaxes(totalPrice, data);
$priceDetails.html('').append(priceDetailsTmpl(data));
$totalPrice.html(data.totalPrice);
}
function showDefaultPriceDetail(currentBasePrice) {
var roomList = [], data = {
'totalBasePrice': checkOutputNumberFormat(currentBasePrice, true),
'nights': (checkoutTimestamp - checkinTimestamp) / dayTime,
'totalPrice': checkOutputNumberFormat(currentBasePrice, true),
'totalOriginalPrice': currentBasePrice
};

if ((false !== discounts) && discounts['discount']['base_percentage']) {
Object.keys(discounts['discount']['details']).forEach(function (key) {
var discountItem = discounts['discount']['details'][key];
data[key] = ('-' + checkOutputNumberFormat(multiplication(currentBasePrice, discountItem['discount'])));
});
data['totalOriginalPrice'] = multiplication(currentBasePrice, discounts.totleDiscount);
data['totalPrice'] = checkOutputNumberFormat(data['totalOriginalPrice'], true);
}

for (var i = checkinTimestamp; i < checkoutTimestamp; i += dayTime) {
if (priceList[i]) {
if ('available' == priceList[i]['status']) {
var rate = priceList[i]['special_price_rate'] ? priceList[i]['special_price_rate'] : 1,
originalPrice = loftoceanRoomReservation.pricePerPerson
? add(multiplication(priceList[i]['adult_price'], adultNumber), multiplication(priceList[i]['child_price'], childNumber))
: multiplication(priceList[i]['price'], roomNumber);
roomList.push({
'date': priceList[i]['start'],
'originalPrice': checkOutputNumberFormat(originalPrice, true),
'price': checkOutputNumberFormat(multiplication(originalPrice, rate), true)
});
} else {
roomList.push({
'date': priceList[i]['start'],
'price': false
});
}
}
}
data.rooms = roomList;
checkTaxes(currentBasePrice, data);
$priceDetails.html('').append(priceDetailsTmpl(data));
}
function afterCheckinCheckoutChanged() {
checkinDate = $checkinDate.val();
checkoutDate = $checkoutDate.val();
calculateRoomTotalPrice();
calculateihxxServiceTotalPrice();
updateRoomMessage();
updateLowestPrice();
updateTotalPrice();
}
function checkFlexiblePriceRules() {
if (hasFlexibilePriceRules) {
var data = { 'roomID': loftoceanRoomReservation.roomID, 'checkin': checkinTimestamp, 'checkout': checkoutTimestamp, 'action': loftoceanRoomReservation.getFlexiblePriceRuleAjaxAction };
$errorMessage.html('');
$successMessage.html('');
$loading.addClass('loading');
$.ajax(loftoceanRoomReservation.ajaxURL, { 'method': 'GET', 'data': data }).done(function (data, status) {
data = data ? JSON.parse(data) : {};
discounts = (data && data.status && (1 == data.status)) ? data.discount : false;
}).fail(function () {
discounts = false;
}).always(function () {
afterCheckinCheckoutChanged();
$loading.removeClass('loading');
});
} else {
afterCheckinCheckoutChanged();
}
}

function calculateihxxServiceTotalPrice() {
var $services = $reservationForm.find('.cs-form-group.cs-ihxx-service-group .ihxx-service-switcher:checked'), servicePriceSum = 0;
if ($services.length) {
$services.each(function () {
var $parent = $(this).parent(), serviceID = 'ihxx_service_' + $(this).val(),
servicePrice = $parent.find('input[name="ihxx_service_price[' + serviceID + ']"]').val(),
serviceCalculatingMethod = $parent.find('input[name="ihxx_service_calculating_method[' + serviceID + ']"]').val();

switch (serviceCalculatingMethod) {
case 'custom':
var customQuantity = $parent.parent().find('input[name="ihxx_service_quantity[' + serviceID + ']"]').val();
servicePriceSum = add(servicePriceSum, multiplication(servicePrice, customQuantity));
break;
case 'auto':
var autoCalculatingUnit = $parent.find('input[name="ihxx_service_auto_calculating_unit[' + serviceID + ']"]').val();
if (['night-room'].includes(autoCalculatingUnit)) {
servicePrice = multiplication(servicePrice, parseInt(roomNumber, 10));
}
if (['person', 'night-person'].includes(autoCalculatingUnit)) {
var $customAdultPrice = $parent.find('input[name="ihxx_service_auto_calculating_custom_adult_price[' + serviceID + ']"]'),
$customChildPrice = $parent.find('input[name="ihxx_service_auto_calculating_custom_child_price[' + serviceID + ']"]');
if ($customAdultPrice.length && $customChildPrice.length) {
var customAdultPrice = $customAdultPrice.val() ? $customAdultPrice.val() : 0,
customChildPrice = $customChildPrice.val() ? $customChildPrice.val() : 0;
servicePrice = add(multiplication(customAdultPrice, parseInt(adultNumber, 10)), multiplication(customChildPrice, parseInt(childNumber, 10)));
} else {
servicePrice = multiplication(servicePrice, (parseInt(adultNumber, 10) + parseInt(childNumber, 10)));
}
}
if (['night', 'night-person', 'night-room'].includes(autoCalculatingUnit)) {
servicePrice = multiplication(servicePrice, (checkoutTimestamp - checkinTimestamp) / dayTime);
}

servicePriceSum = add(servicePriceSum, servicePrice);
break;
default:
servicePriceSum = add(servicePriceSum, servicePrice);
}
});
}
ihxxServiceTotalPrice = servicePriceSum;
}
function calculateRoomTotalPrice() {
var startTime = new Date(checkinDate), endTime = new Date(checkoutDate),
startTimestamp = getTimeStamp(startTime), endTimestamp = getTimeStamp(endTime),
priceSum = 0, adultPriceSum = 0, childPriceSum = 0;
if (typeof priceList[endTimestamp - dayTime] == 'undefined') {
startTime.setDate(startTime.getDate() - 15);
endTime.setDate(endTime.getDate() + 15);
getRemotePriceList(getDateValue(startTime), getDateValue(endTime));
} else {
for (var i = startTimestamp; i < endTimestamp; i += dayTime) {
if (priceList[i] && ('available' == priceList[i]['status'])) {
var rate = priceList[i]['special_price_rate'] ? priceList[i]['special_price_rate'] : 1;
priceSum = add(priceSum, multiplication(priceList[i]['price'], rate));
adultPriceSum = add(adultPriceSum, multiplication(priceList[i]['adult_price'], rate));
childPriceSum = add(childPriceSum, multiplication(priceList[i]['child_price'], rate));
}
}
roomTotalPrice = priceSum;
adultTotalPrice = adultPriceSum;
childTotalPrice = childPriceSum;
}
}
function redirectToCartPage(url) {
window.location.href = url;
}
function getTimeStamp(date) {
if (typeof date != 'undefined' && !date.getTime) {
date = new Date();
}
return Math.floor(date.getTime() / dayTime / 1000) * dayTime;
}
function updateTotalPrice() {
var roomPriceSum = loftoceanRoomReservation.pricePerPerson
? add(multiplication(adultTotalPrice, adultNumber), multiplication(childTotalPrice, childNumber))
: multiplication(roomTotalPrice, roomNumber);
if ((false !== discounts) && discounts.totleDiscount) {
originalTotalPrice = roomPriceSum;
roomPriceSum = multiplication(roomPriceSum, discounts.totleDiscount);
} else {
originalTotalPrice = roomPriceSum;
}
finalRoomTotalPrice = roomPriceSum;

updatePriceDetails();
}
function getRemotePriceList(startTime, endTime) {
if (roomID && startTime && endTime) {
$.ajax({
url: wpApiSettings.root + 'loftocean/v1/get_room_availability/' + roomID + '/' + startTime + '/' + endTime,
type: 'GET',
success: function (data, status) {
if (typeof data == "object") {
data.forEach(function (item) {
priceList[item['id']] = item;
});
calculateRoomTotalPrice();
calculateihxxServiceTotalPrice();
updateTotalPrice();
}
}, error: function (e) {
alert(i18nText.getRemotePriceListErrorMessage);
}
});
}
}
function checkOutputNumberFormat(num, ignoreSymbal) {
var m = 0, tmpNum = 0, numStr = '', thousand = 1000;
num = ('undefined' == typeof num) ? 0 : (isNumber(num) ? num : 0);
try { m = ('' + num).split('.')[1].length; } catch (e) { m = 0; }
num = Number(num).toFixed(m ? Math.max(0, loftoceanRoomReservation.currencySettings.precision) : 0);
num = ('' + num).split('.');

numStr = Number(num[0]);
if (loftoceanRoomReservation.currencySettings.thousandSeparator) {
tmpNum = Number(num[0]);
if (tmpNum > thousand) {
numStr = (tmpNum + '').substr(-3)
tmpNum = Math.floor(tmpNum / thousand);
while (tmpNum > thousand) {
numStr = (tmpNum + '').substr(-3) + loftoceanRoomReservation.currencySettings.thousandSeparator + numStr;
tmpNum = Math.floor(tmpNum / thousand);
}
if (tmpNum > 0) {
numStr = tmpNum + loftoceanRoomReservation.currencySettings.thousandSeparator + numStr;
}
}
}
if ((num.length > 1) && (Number(num[1]) > 0) && loftoceanRoomReservation.currencySettings.precision && loftoceanRoomReservation.currencySettings.decimalSeparator) {
numStr += loftoceanRoomReservation.currencySettings.decimalSeparator + num[1];
}

return ignoreSymbal ? numStr : loftoceanRoomReservation.currency['left'] + numStr + loftoceanRoomReservation.currency['right'];
}
function addLeadingZero(num) {
return num > 9 ? num : '0' + num;
}
function getDateValue(date) {
return date.getFullYear() + '-' + addLeadingZero(date.getMonth() + 1) + '-' + addLeadingZero(date.getDate());
}

function isNumber(value) {
return (!isNaN(value)) && isFinite(value);
}

function add(arg1, arg2) {
var m1, m2, m, sum = 0;
try { m1 = ('' + arg1).split('.')[1].length; } catch (e) { m1 = 0; }
try { m2 = ('' + arg2).split('.')[1].length; } catch (e) { m2 = 0; }
m = Math.max(m1, m2);
sum = (arg1 * Math.pow(10, m) + arg2 * Math.pow(10, m)) / Math.pow(10, m);
return sum.toFixed(m);
}
function subtraction(arg1, arg2) {
return add(arg1, (- arg2));
}
function multiplication(arg1, arg2) {
var m1, m2, result = 0;
try { m1 = ('' + arg1).split('.')[1].length; } catch (e) { m1 = 0; }
try { m2 = ('' + arg2).split('.')[1].length; } catch (e) { m2 = 0; }
result = (arg1 * Math.pow(10, m1)) * (arg2 * Math.pow(10, m2)) / Math.pow(10, (m1 + m2));
return result.toFixed(m1 + m2);
}

function checkDateAvailability(date, drp) {
date = date.format(dateFormat);
if ((typeof drp === 'undefined' || null === drp.startDate || null !== drp.endDate) && disabledStartDates.includes(date)) {
return [false, '', ''];
} else {
var notSetEndDateYet = (typeof drp !== 'undefined' && null !== drp.startDate && null === drp.endDate);
if (notSetEndDateYet) {
if (moment(date).isBefore(drp.startDate)) return [false, '', ''];

if (disabledEndDates.length) {
if (disabledEndDates.includes(date)) return [false, '', ''];

var currentVerifyDate = drp.startDate.clone(), validEndDate = moment(date);
currentVerifyDate.add('1', 'day');
while (currentVerifyDate.isBefore(validEndDate)) {
if (disabledStartDates.includes(currentVerifyDate.format(dateFormat))) {
return [false, '', ''];
}
currentVerifyDate.add('1', 'day');
}
}
}

var d = new Date(date), dayOfWeek = 'day' + d.getDay(), currentTimstamp = getTimeStamp(d), classes = [], messages = [];
if (loftoceanRoomReservation.unavailableDates) {
if (loftoceanRoomReservation.unavailableDates['in_advance'] && loftoceanRoomReservation.unavailableDates['in_advance']['length']) {
for (let i = 0; i < loftoceanRoomReservation.unavailableDates['in_advance'].length; i++) {
let inAdvanceItem = loftoceanRoomReservation.unavailableDates['in_advance'][i];
if (('all' == inAdvanceItem.id) || ((inAdvanceItem.start <= currentTimstamp) && (currentTimstamp <= inAdvanceItem.end))) {
if (inAdvanceItem.min && (((currentTimstamp - todayTimestamp) / dayTime) < inAdvanceItem.min)) {
classes.push('disabled', 'checkin-unavailable');
}
if (inAdvanceItem.max && (((currentTimstamp - todayTimestamp) / dayTime) > inAdvanceItem.max)) {
classes.push('checkin-unavailable');
if (('undefined' === typeof drp) || (null === drp.startDate || null !== drp.endDate)) {
classes.push(' disabled');
}
}
break;
}
}
}
if (loftoceanRoomReservation.unavailableDates.checkin && loftoceanRoomReservation.unavailableDates.checkin.length) {
for (let i = 0; i < loftoceanRoomReservation.unavailableDates.checkin.length; i++) {
let disabledCheckItem = loftoceanRoomReservation.unavailableDates.checkin[i];
if (('all' == disabledCheckItem.id) || ((disabledCheckItem.start <= currentTimstamp) && (currentTimstamp <= disabledCheckItem.end))) {
if (disabledCheckItem.days.includes(dayOfWeek)) {
classes.push('no-checkin', 'checkin-unavailable');
messages.push(i18nText.noCheckin);
}
break;
}
}
}
if (loftoceanRoomReservation.unavailableDates.checkout && loftoceanRoomReservation.unavailableDates.checkout.length) {
for (let i = 0; i < loftoceanRoomReservation.unavailableDates.checkout.length; i++) {
let disabledCheckItem = loftoceanRoomReservation.unavailableDates.checkout[i];
if (('all' == disabledCheckItem.id) || ((disabledCheckItem.end >= currentTimstamp) && (currentTimstamp >= disabledCheckItem.start))) {
if (disabledCheckItem.days.includes(dayOfWeek)) {
classes.push('no-checkout', 'checkout-unavailable');
messages.push(i18nText.noCheckout);
}
break;
}
}
}
if (notSetEndDateYet) {
if (loftoceanRoomReservation.unavailableDates['stay_length'] && loftoceanRoomReservation.unavailableDates['stay_length']['length']) {
var startDateTimestamp = getTimeStamp(new Date(drp.startDate.format(dateFormat)));
if (currentTimstamp > startDateTimestamp) {
for (let i = 0; i < loftoceanRoomReservation.unavailableDates['stay_length']['length']; i++) {
let stayLengthItem = loftoceanRoomReservation.unavailableDates['stay_length'][i];
if (('all' == stayLengthItem.id) || ((stayLengthItem.end >= startDateTimestamp) && (startDateTimestamp >= stayLengthItem.start))) {
var daysAfterStart = (currentTimstamp - startDateTimestamp) / dayTime;
if (stayLengthItem.rules[dayOfWeek]) {
if (daysAfterStart < stayLengthItem.rules[dayOfWeek]['min']) {
classes.push('minimal-stay-unavailable', 'checkout-unavailable');
messages.push(stayLengthItem.rules[dayOfWeek]['min'] + i18nText.minimum);
}
if (daysAfterStart > stayLengthItem.rules[dayOfWeek]['max']) {
classes.push('off', 'disabled', 'maximal-stay-unavailable', 'checkout-unavailable');
messages.push(stayLengthItem.rules[dayOfWeek]['max'] + i18nText.maximum);
}
}
break;
}
}
}
}
}
}
return [true, classes.length ? classes.join(' ') : '', messages.length ? messages.join(', ') : ''];
}
return [true, '', ''];
}

function updateBookingDates(startDate, endDate) {
$checkinDate.val(startDate);
$checkoutDate.val(endDate);

checkinDate = startDate;
checkinTimestamp = getTimeStamp(new Date(startDate));
checkoutDate = endDate;
checkoutTimestamp = getTimeStamp(new Date(endDate));

checkihxxServiceList(checkinTimestamp, checkoutTimestamp);
checkFlexiblePriceRules();
}
function getDefaultAvailableDates(checkin, checkout) {
var i = 0, j = 0, max = 70, currentStartDate = checkin.clone(), currentEndDate = null;
while (i++ < max) {
var startDateStatus = checkDateAvailability(currentStartDate);
if ((!startDateStatus[0]) || (startDateStatus[1] && startDateStatus[1].split(' ').includes('checkin-unavailable'))) {
currentStartDate.add('1', 'day');
continue;
}

j = 0; currentEndDate = currentStartDate.clone().add('1', 'day');
var checkoutValidationArgs = { 'startDate': currentStartDate, 'endDate': null };
while (j++ < max) {
var endDateStatus = checkDateAvailability(currentEndDate, checkoutValidationArgs);
if ((!endDateStatus[0]) || (endDateStatus[1] && endDateStatus[1].split(' ').includes('checkout-unavailable'))) {
currentEndDate.add('1', 'day');
continue;
}
return { 'checkin': currentStartDate.format(dateFormat), 'checkout': currentEndDate.format(dateFormat) };
}
currentStartDate.add('1', 'day');
}
return { 'checkin': checkin.format(dateFormat), 'checkout': checkout.format(dateFormat) };
}
function checkihxxServiceList(checkin, checkout) {
if (hasihxxServices && hasCustomihxxServices) {
var currentList = [];
hasCustomihxxServices = false;
loftoceanRoomReservation.ihxxServices.forEach(function (item) {
if (('' !== item.effective_time) && item.custom_effective_time_slots.length) {
hasCustomihxxServices = true;
var passDeactivated = true, isActivated = ('activated' == item.effective_time);
for (let i = 0; i < item.custom_effective_time_slots.length; i++) {
var cets = item.custom_effective_time_slots[i];
if (((!cets.start_timestamp) || (cets.start_timestamp <= checkin))
&& ((!cets.end_timstamp) || (cets.end_timstamp >= checkout))) {
if (isActivated) {
currentList.push($.extend({}, item));
} else {
passDeactivated = false;
}
break;
}
}
if ((!isActivated) && passDeactivated) {
currentList.push($.extend({}, item));
}
} else {
currentList.push($.extend({}, item));
}
});
var $ihxxServiceList = $('#secondary .cs-form-group.cs-ihxx-service-group');
$ihxxServiceList.length ? $ihxxServiceList.remove() : '';
if (currentList.length) {
$totalPriceSection.before(ihxxServiceListTmpl({ 'currency': loftoceanRoomReservation.currency, 'services': currentList }));
}
}
}
function checkTaxes(price, data) {
if (loftoceanRoomReservation.isTaxEnabled) {
if (loftoceanRoomReservation.taxIncluded) {
var taxes = calculate_included_tax(price);
data.tax = checkOutputNumberFormat(taxes.totalTax);
data.taxDetails = taxes.taxDetails;
} else {
var taxes = calculate_exclude_tax(price);
data.tax = checkOutputNumberFormat(taxes.totalTax);
data.taxDetails = taxes.taxDetails;
data.beforeTax = data.totalPrice;
data.totalPrice = checkOutputNumberFormat(add(data.totalOriginalPrice, taxes.totalTax), true);
}
}
}
function calculate_included_tax(price) {
var precision = add(loftoceanRoomReservation.currencySettings.precision, 2),
taxes = loftoceanRoomReservation.taxRate, taxDetails = [],
priceBeforeTax = price, currentPrice = 0;
if (taxes['reversed_compound_rates'] && taxes['reversed_compound_rates'].length) {
for (var i = 0; i < taxes['reversed_compound_rates'].length; i++) {
currentPrice = priceBeforeTax;
priceBeforeTax = multiplication(priceBeforeTax, (100 / (100 + taxes['reversed_compound_rates'][i]['rate'])));
priceBeforeTax = Number(priceBeforeTax).toFixed(precision);
taxDetails.unshift({ 'tax': checkOutputNumberFormat(subtraction(currentPrice, priceBeforeTax)), 'label': taxes['reversed_compound_rates'][i]['label'] });
}
}
if (taxes['regular_rates'] && taxes['regular_rates'].length) {
var rateSum = 100;
for (var i = 0; i < taxes['regular_rates'].length; i++) {
rateSum = add(rateSum, taxes['regular_rates'][i]['rate']);
}
priceBeforeTax = multiplication(priceBeforeTax, 100 / rateSum);
priceBeforeTax = Number(priceBeforeTax).toFixed(precision);

for (i -= 1; i >= 0; i--) {
taxDetails.push({ 'tax': checkOutputNumberFormat(multiplication(priceBeforeTax, taxes['regular_rates'][i]['rate'] / 100)), 'label': taxes['regular_rates'][i]['label'] });
}
}
return { 'totalTax': subtraction(price, priceBeforeTax), 'taxDetails': taxDetails };
}
function calculate_exclude_tax(price) {
var taxes = loftoceanRoomReservation.taxRate,
priceForCompound = price, totalTax = 0,
taxDetails = [];
if (taxes['regular_rates'] && taxes['regular_rates'].length) {
var currentTax = 0
for (var i = 0; i < taxes['regular_rates'].length; i++) {
currentTax = multiplication(price, (taxes['regular_rates'][i]['rate'] / 100));
taxDetails.push({ 'tax': checkOutputNumberFormat(currentTax), 'label': taxes['regular_rates'][i]['label'] });
totalTax = add(totalTax, currentTax);
}
priceForCompound = add(price, totalTax);
}
if (taxes['compound_rates'] && taxes['compound_rates'].length) {
var compoundTax = 0;
for (var i = 0; i < taxes['compound_rates'].length; i++) {
compoundTax = multiplication(priceForCompound, (taxes['compound_rates'][i]['rate'] / 100));
totalTax = add(totalTax, compoundTax);
priceForCompound = add(priceForCompound, compoundTax);
taxDetails.push({ 'tax': checkOutputNumberFormat(compoundTax), 'label': taxes['compound_rates'][i]['label'] });
}
}
return { 'totalTax': totalTax, 'taxDetails': taxDetails };
}

document.addEventListener('DOMContentLoaded', function () {
if ('undefined' == loftoceanRoomReservation) return false;

$reservationForm = $('#secondary .cs-reservation-form');

priceDetailsTmpl = wp.template('loftocean-room-price-details');
ihxxServiceListTmpl = wp.template('loftocean-room-ihxx-services');
hasihxxServices = loftoceanRoomReservation.ihxxServices && loftoceanRoomReservation.ihxxServices.length;
hasCustomihxxServices = true;

$basePrice = $('#secondary .base-price');
$loading = $('#secondary .cs-room-booking');
$priceDetails = $('#secondary .cs-form-price-details');

$totalPriceSection = $reservationForm.find('.cs-form-total-price');
$totalPrice = $totalPriceSection.find('.total-price-number');
priceList = loftoceanRoomReservation.priceList;
roomID = loftoceanRoomReservation.roomID;
i18nText = loftoceanRoomReservation.i18nText;
hasFlexibilePriceRules = !!loftoceanRoomReservation.hasFlexibilePriceRules;
defaultCheckoutDate = new Date();
defaultCheckoutDate.setDate(defaultCheckoutDate.getDate() + 1);
defaultCheckoutTimeStamp = getTimeStamp(defaultCheckoutDate);
defaultCheckoutDate = getDateValue(defaultCheckoutDate);

$checkinDate = $reservationForm.find('.cs-check-in input[name=checkin]');
$checkoutDate = $reservationForm.find('.cs-check-out input[name=checkout]');
$roomNumber = $reservationForm.find('.cs-rooms input[name=room-quantity]');
$adultNumber = $reservationForm.find('.cs-adults input[name=adult-quantity]');
$childNumber = $reservationForm.find('.cs-children input[name=child-quantity]');

$roomMessage = $reservationForm.find('.cs-form-field.cs-rooms > .cs-form-notice');
$errorMessage = $reservationForm.children('.cs-form-error-message');
$successMessage = $reservationForm.children('.cs-form-success-message');
$availabilityCalendar = $('.room-availability-calendar-wrapper .hidden-calendar');
hasAvailabilityCalendar = $availabilityCalendar.length;

todayTimestamp = getTimeStamp('');
$.each(loftoceanRoomReservation.priceList, function (i, item) {
if (('unavailable' == item.status) || (item.available_number < 1)) {
disabledStartDates.push(item.start);
disabledEndDates.push(item.end);
}
});

var defaultsDates = getDefaultAvailableDates(moment(), moment().add('1', 'day')),
defaultStartDate = defaultsDates.checkin,
defaultEndDate = defaultsDates.checkout;

$checkinDate.val(defaultStartDate);
$checkoutDate.val(defaultEndDate);
checkinDate = defaultStartDate;
checkinTimestamp = getTimeStamp(new Date(checkinDate));
checkoutDate = defaultEndDate;
checkoutTimestamp = getTimeStamp(new Date(checkoutDate));
adultNumber = $adultNumber.val();
childNumber = $childNumber.val();
roomNumber = $roomNumber.val();
roomTotalPrice = 0;
adultTotalPrice = 0;
childTotalPrice = 0;
ihxxServiceTotalPrice = 0;

var $dateRangePicker = $reservationForm.find('.date-range-picker');
if (hasAvailabilityCalendar) {
$availabilityCalendar.daterangepicker({
parentEl: '.room-availability-calendar-wrapper',
minDate: moment().format(dateFormat),
maxDate: moment().add('1', 'year').format(dateFormat),
startDate: defaultStartDate,
endDate: defaultEndDate,
alwaysShowCalendars: true,
locale: { format: dateFormat },
beforeShowDay: function (date, drp) {
return checkDateAvailability(date, drp);
}
}).trigger('click').on('apply.daterangepicker', function (e, drp) {
drp.show();
var startDate = drp.startDate.format(dateFormat), endDate = drp.endDate.format(dateFormat);

if ($reservationForm.length) {
$dateRangePicker.val(startDate + ' - ' + endDate);
updateBookingDates(startDate, endDate);

$('html, body').animate({ scrollTop: $checkinDate.offset().top - window.innerHeight / 2 }, 200);
}
}).on('cancel.daterangepicker', function (e, drp) {
drp.show();
drp.setStartDate(defaultStartDate);
drp.setEndDate(defaultEndDate);
drp.updateView();
}).on('outsideClick.daterangepicker', function (e, drp) { drp.show(); });
}

$('#content.site-content.with-sidebar-right').length ? $dateRangePicker.addClass('pull-right') : '';
$dateRangePicker.daterangepicker({
minDate: moment().format(dateFormat),
maxDate: moment().add('1', 'year').format(dateFormat),
startDate: defaultStartDate,
endDate: defaultEndDate,
locale: { format: dateFormat },
autoApply: true,
beforeShowDay: function (date, drp) {
return checkDateAvailability(date, drp);
}
}).on('apply.daterangepicker', function (e, drp) {
var startDate = drp.startDate.format(dateFormat), endDate = drp.endDate.format(dateFormat);
$(this).val(startDate + ' - ' + endDate);
updateBookingDates(startDate, endDate);

if (hasAvailabilityCalendar) {
var dateRangePicker = $availabilityCalendar.data('daterangepicker');
dateRangePicker.setStartDate(startDate);
dateRangePicker.setEndDate(endDate);
dateRangePicker.updateView();
}
});
$reservationForm.find('.checkin-date, .checkout-date').on('click', function (e) {
var dateRangePicker = $dateRangePicker.data('daterangepicker'),
tmpCurrentCheckin = moment($checkinDate.val() ? $checkinDate.val() : ''),
tmpCurrentCheckout = moment($checkoutDate.val() ? $checkoutDate.val() : ''),
currentDates, currentCheckinDate, currentCheckoutDate;

tmpCurrentCheckin = tmpCurrentCheckin.isValid() ? tmpCurrentCheckin : moment();
tmpCurrentCheckout = tmpCurrentCheckout.isAfter(tmpCurrentCheckin) ? tmpCurrentCheckout : tmpCurrentCheckin.clone().add('1', 'day');
currentDates = getDefaultAvailableDates(tmpCurrentCheckin, tmpCurrentCheckout);
currentCheckinDate = currentDates.checkin;
currentCheckoutDate = currentDates.checkout;

dateRangePicker.setStartDate(currentCheckinDate);
dateRangePicker.setEndDate(currentCheckoutDate);
dateRangePicker.show();
});

if ($priceDetails.length) {
$totalPriceSection.on('click', function (e) {
var $self = $(this);
if ($priceDetails.hasClass('hide')) {
$self.addClass('toggled-on');
$priceDetails.removeClass('hide');
} else {
$self.removeClass('toggled-on');
$priceDetails.addClass('hide');
}
});
}
$reservationForm.on('change', '.cs-form-group.cs-ihxx-service-group .label-checkbox .ihxx-service-switcher', function () {
calculateihxxServiceTotalPrice();
updateTotalPrice();
}).on('click', '.cs-form-group.cs-ihxx-service-group .ihxx-service-custom-quantity button', function (e) {
setTimeout(function () {
calculateihxxServiceTotalPrice();
updateTotalPrice();
}, 50);
});
$roomNumber.parent().on('click', 'button', function (e) {
$roomMessage.removeClass('show');
clearTimeout(messageTimer);
setTimeout(function () {
roomNumber = $roomNumber.val();
updateTotalPrice();
}, 50);
});
$adultNumber.parent().on('click', 'button', function (e) {
setTimeout(function () {
adultNumber = $adultNumber.val();
calculateRoomTotalPrice();
calculateihxxServiceTotalPrice();
updateTotalPrice();
if (loftoceanRoomReservation.pricePerPerson) {
updateLowestPrice();
}
}, 50);
});
$childNumber.parent().on('click', 'button', function (e) {
setTimeout(function () {
childNumber = $childNumber.val();
calculateRoomTotalPrice();
calculateihxxServiceTotalPrice();
updateTotalPrice();
if (loftoceanRoomReservation.pricePerPerson) {
updateLowestPrice();
}
}, 50);
});
$('body').on('click', function (e) {
var $target = $(e.target), $priceBreakdown = $('.csf-base-price-breakdown');
if ($priceBreakdown.length && (!$target.hasClass('csf-base-price-breakdown')) && (!$target.parents('.csf-base-price-breakdown').length)) {
$('.csf-base-price-breakdown').removeClass('show');
}
}).on('mouseenter', '.daterangepicker-has-tooltip', function () {
var $toolTip = $(this).find('.day-tooltip');
$toolTip.length ? $toolTip.removeClass('hide') : '';
}).on('mouseleave', '.daterangepicker-has-tooltip', function () {
var $toolTip = $(this).find('.day-tooltip');
$toolTip.length ? $toolTip.addClass('hide') : '';
});
$reservationForm.on('click', '.csf-pd-total-base .csf-pd-label', function (e) {
e.stopImmediatePropagation();
e.stopPropagation();
var $priceBreakdown = $(this).siblings('.csf-base-price-breakdown');
$priceBreakdown.hasClass('show') ? '' : $priceBreakdown.addClass('show');
}).on('click', '.cs-submit button', function (e) {
e.preventDefault();
var data = { 'roomID': loftoceanRoomReservation.roomID, 'action': loftoceanRoomReservation.addRoomToCartAjaxAction },
options = $reservationForm.find('input,select,cheeckbox').serializeArray();
options.forEach(function (option) {
data[option['name']] = option['value'];
});
$errorMessage.html('');
$successMessage.html('');
$loading.addClass('loading');
$.ajax(loftoceanRoomReservation.ajaxURL, { 'method': 'GET', 'data': data }).done(function (data, status) {
var processed = false;
if ('success' == status) {
data = data ? JSON.parse(data) : {};
if ('object' == typeof data) {
if (data.message) {
processed = true;
$errorMessage.html('<p>' + data.message + '</p>');
} else if (data.redirect) {
processed = true;
$successMessage.html('<p>' + i18nText.bookingSuccess + '</p>');
setTimeout(function () {
window.location.href = data.redirect;
}, 500);
}
}
}
processed ? '' : $errorMessage.html('<p>' + i18nText.bookingError + '</p>');
}).fail(function () {
$errorMessage.html('<p>' + i18nText.bookingError + '</p>');
}).always(function () {
$loading.removeClass('loading');
});
return false;
});

checkihxxServiceList(checkinTimestamp, checkoutTimestamp);
checkFlexiblePriceRules();
$loading.removeClass('loading');
});
})(jQuery);
















(function ($) {
	"use strict";
	var $reservationForm, $extraServices, priceList, $totalPrice, defaultCheckoutDate, defaultCheckoutTimeStamp, extraServiceTotalPrice, roomTotalPrice,
		adultTotalPrice, childTotalPrice, $checkinDate, $checkoutDate, $roomNumber, $adultNumber, $childNumber, $roomMessage, $errorMessage, $successMessage,
		checkinDate, checkoutDate, roomNumber, adultNumber, childNumber, checkinTimestamp, checkoutTimestamp, dayTime = 86400, roomID, i18nText,
		discounts = false, hasFlexibilePriceRules = false, $loading, $priceDetails, $basePrice, originalTotalPrice, discountBasePrice, finalRoomTotalPrice,
		priceDetailsTmpl, extraServiceListTmpl, $availabilityCalendar, todayTimestamp, disabledStartDates = [], disabledEndDates = [], dateFormat = 'YYYY-MM-DD',
		hasExtraServices, hasCustomExtraServices, $totalPriceSection, hasAvailabilityCalendar, messageTimer = false;

	function updateLowestPrice() {
		var lowest = false, originalLowest = false;
		for (var i = checkinTimestamp; i < checkoutTimestamp; i += dayTime) {
			if (priceList[i] && ('available' == priceList[i]['status'])) {
				var currentActualPrice, currentOriginalPrice = loftoceanRoomReservation.pricePerPerson
					? add(multiplication(priceList[i]['adult_price'], adultNumber), multiplication(childNumber, priceList[i]['child_price']))
					: priceList[i]['price'];

				currentActualPrice = priceList[i]['special_price_rate'] ? multiplication(currentOriginalPrice, priceList[i]['special_price_rate']) : currentOriginalPrice;

				if ((false === lowest) || (Number(currentActualPrice) < Number(lowest))) {
					lowest = currentActualPrice;
				}
				if ((false === originalLowest) || (Number(currentOriginalPrice) < Number(originalLowest))) {
					originalLowest = currentOriginalPrice;
				}
			}
		}
		if (false !== lowest) {
			var currentBasePrice = '';
			if (originalLowest > lowest) {
				currentBasePrice = '<del>' + checkOutputNumberFormat(originalLowest) + '</del> <span class="sale">' + checkOutputNumberFormat(lowest) + '</span>';
			} else {
				currentBasePrice = checkOutputNumberFormat(lowest);
			}
			$basePrice.html(currentBasePrice);
		}
	}
	function updateRoomMessage() {
		if (!$roomMessage.length) return;

		var lowest = false, failed = false;
		clearTimeout(messageTimer);
		$roomMessage.removeClass('show');
		$roomNumber.removeData('max');
		for (var i = checkinTimestamp; i < checkoutTimestamp; i += dayTime) {
			if (priceList[i] && ('available' == priceList[i]['status']) && (! !priceList[i]['available_number'])) {
				if ((false === lowest) || (Number(priceList[i]['available_number']) < lowest)) {
					lowest = Number(priceList[i]['available_number']);
				}
			} else {
				failed = true;
				break;
			}
		}
		if ((!failed) && (false !== lowest) && (lowest > 0)) {
			$roomNumber.data('max', lowest);
			if (roomNumber > lowest) {
				$roomMessage.find('.room-error-limit-number').text(lowest);
				$roomNumber.val(lowest - 1).siblings('.plus').trigger('click');
				$roomMessage.addClass('show');
				messageTimer = setTimeout(function () { $roomMessage.removeClass('show'); }, 3000);
			}
		}
	}
	function updatePriceDetails() {
		var roomList = [], totalPrice = add(finalRoomTotalPrice, extraServiceTotalPrice),
			data = {
				'totalBasePrice': checkOutputNumberFormat(originalTotalPrice, true),
				'nights': (checkoutTimestamp - checkinTimestamp) / dayTime,
				'totalPrice': checkOutputNumberFormat(totalPrice, true),
				'totalOriginalPrice': totalPrice
			};
		if (extraServiceTotalPrice) {
			data.extraService = checkOutputNumberFormat(extraServiceTotalPrice, true);
		}
		if ((false !== discounts) && discounts['discount']['base_percentage']) {
			Object.keys(discounts['discount']['details']).forEach(function (key) {
				var discountItem = discounts['discount']['details'][key];
				data[key] = ('-' + checkOutputNumberFormat(multiplication(originalTotalPrice, discountItem['discount'])));
			});
		}

		for (var i = checkinTimestamp; i < checkoutTimestamp; i += dayTime) {
			if (priceList[i]) {
				if ('available' == priceList[i]['status']) {
					var rate = priceList[i]['special_price_rate'] ? priceList[i]['special_price_rate'] : 1,
						originalPrice = loftoceanRoomReservation.pricePerPerson
							? add(multiplication(priceList[i]['adult_price'], adultNumber), multiplication(priceList[i]['child_price'], childNumber))
							: multiplication(priceList[i]['price'], roomNumber);
					roomList.push({
						'date': priceList[i]['start'],
						'originalPrice': checkOutputNumberFormat(originalPrice, true),
						'price': checkOutputNumberFormat(multiplication(originalPrice, rate), true)
					});
				} else {
					roomList.push({
						'date': priceList[i]['start'],
						'price': false
					});
				}
			}
		}
		data.rooms = roomList;
		checkTaxes(totalPrice, data);
		$priceDetails.html('').append(priceDetailsTmpl(data));
		$totalPrice.html(data.totalPrice);
	}
	function showDefaultPriceDetail(currentBasePrice) {
		var roomList = [], data = {
			'totalBasePrice': checkOutputNumberFormat(currentBasePrice, true),
			'nights': (checkoutTimestamp - checkinTimestamp) / dayTime,
			'totalPrice': checkOutputNumberFormat(currentBasePrice, true),
			'totalOriginalPrice': currentBasePrice
		};

		if ((false !== discounts) && discounts['discount']['base_percentage']) {
			Object.keys(discounts['discount']['details']).forEach(function (key) {
				var discountItem = discounts['discount']['details'][key];
				data[key] = ('-' + checkOutputNumberFormat(multiplication(currentBasePrice, discountItem['discount'])));
			});
			data['totalOriginalPrice'] = multiplication(currentBasePrice, discounts.totleDiscount);
			data['totalPrice'] = checkOutputNumberFormat(data['totalOriginalPrice'], true);
		}

		for (var i = checkinTimestamp; i < checkoutTimestamp; i += dayTime) {
			if (priceList[i]) {
				if ('available' == priceList[i]['status']) {
					var rate = priceList[i]['special_price_rate'] ? priceList[i]['special_price_rate'] : 1,
						originalPrice = loftoceanRoomReservation.pricePerPerson
							? add(multiplication(priceList[i]['adult_price'], adultNumber), multiplication(priceList[i]['child_price'], childNumber))
							: multiplication(priceList[i]['price'], roomNumber);
					roomList.push({
						'date': priceList[i]['start'],
						'originalPrice': checkOutputNumberFormat(originalPrice, true),
						'price': checkOutputNumberFormat(multiplication(originalPrice, rate), true)
					});
				} else {
					roomList.push({
						'date': priceList[i]['start'],
						'price': false
					});
				}
			}
		}
		data.rooms = roomList;
		checkTaxes(currentBasePrice, data);
		$priceDetails.html('').append(priceDetailsTmpl(data));
	}
	function afterCheckinCheckoutChanged() {
		checkinDate = $checkinDate.val();
		checkoutDate = $checkoutDate.val();
		calculateRoomTotalPrice();
		calculateExtraServiceTotalPrice();
		updateRoomMessage();
		updateLowestPrice();
		updateTotalPrice();
	}
	function checkFlexiblePriceRules() {
		if (hasFlexibilePriceRules) {
			var data = { 'roomID': loftoceanRoomReservation.roomID, 'checkin': checkinTimestamp, 'checkout': checkoutTimestamp, 'action': loftoceanRoomReservation.getFlexiblePriceRuleAjaxAction };
			$errorMessage.html('');
			$successMessage.html('');
			$loading.addClass('loading');
			$.ajax(loftoceanRoomReservation.ajaxURL, { 'method': 'GET', 'data': data }).done(function (data, status) {
				data = data ? JSON.parse(data) : {};
				discounts = (data && data.status && (1 == data.status)) ? data.discount : false;
			}).fail(function () {
				discounts = false;
			}).always(function () {
				afterCheckinCheckoutChanged();
				$loading.removeClass('loading');
			});
		} else {
			afterCheckinCheckoutChanged();
		}
	}

	function calculateExtraServiceTotalPrice() {
		var $services = $reservationForm.find('.cs-form-group.cs-extra-service-group .extra-service-switcher:checked'), servicePriceSum = 0;
		if ($services.length) {
			$services.each(function () {
				var $parent = $(this).parent(), serviceID = 'extra_service_' + $(this).val(),
					servicePrice = $parent.find('input[name="extra_service_price[' + serviceID + ']"]').val(),
					serviceCalculatingMethod = $parent.find('input[name="extra_service_calculating_method[' + serviceID + ']"]').val();

				switch (serviceCalculatingMethod) {
					case 'custom':
						var customQuantity = $parent.parent().find('input[name="extra_service_quantity[' + serviceID + ']"]').val();
						servicePriceSum = add(servicePriceSum, multiplication(servicePrice, customQuantity));
						break;
					case 'auto':
						var autoCalculatingUnit = $parent.find('input[name="extra_service_auto_calculating_unit[' + serviceID + ']"]').val();
						if (['night-room'].includes(autoCalculatingUnit)) {
							servicePrice = multiplication(servicePrice, parseInt(roomNumber, 10));
						}
						if (['person', 'night-person'].includes(autoCalculatingUnit)) {
							var $customAdultPrice = $parent.find('input[name="extra_service_auto_calculating_custom_adult_price[' + serviceID + ']"]'),
								$customChildPrice = $parent.find('input[name="extra_service_auto_calculating_custom_child_price[' + serviceID + ']"]');
							if ($customAdultPrice.length && $customChildPrice.length) {
								var customAdultPrice = $customAdultPrice.val() ? $customAdultPrice.val() : 0,
									customChildPrice = $customChildPrice.val() ? $customChildPrice.val() : 0;
								servicePrice = add(multiplication(customAdultPrice, parseInt(adultNumber, 10)), multiplication(customChildPrice, parseInt(childNumber, 10)));
							} else {
								servicePrice = multiplication(servicePrice, (parseInt(adultNumber, 10) + parseInt(childNumber, 10)));
							}
						}
						if (['night', 'night-person', 'night-room'].includes(autoCalculatingUnit)) {
							servicePrice = multiplication(servicePrice, (checkoutTimestamp - checkinTimestamp) / dayTime);
						}

						servicePriceSum = add(servicePriceSum, servicePrice);
						break;
					default:
						servicePriceSum = add(servicePriceSum, servicePrice);
				}
			});
		}
		extraServiceTotalPrice = servicePriceSum;
	}
	function calculateRoomTotalPrice() {
		var startTime = new Date(checkinDate), endTime = new Date(checkoutDate),
			startTimestamp = getTimeStamp(startTime), endTimestamp = getTimeStamp(endTime),
			priceSum = 0, adultPriceSum = 0, childPriceSum = 0;
		if (typeof priceList[endTimestamp - dayTime] == 'undefined') {
			startTime.setDate(startTime.getDate() - 15);
			endTime.setDate(endTime.getDate() + 15);
			getRemotePriceList(getDateValue(startTime), getDateValue(endTime));
		} else {
			for (var i = startTimestamp; i < endTimestamp; i += dayTime) {
				if (priceList[i] && ('available' == priceList[i]['status'])) {
					var rate = priceList[i]['special_price_rate'] ? priceList[i]['special_price_rate'] : 1;
					priceSum = add(priceSum, multiplication(priceList[i]['price'], rate));
					adultPriceSum = add(adultPriceSum, multiplication(priceList[i]['adult_price'], rate));
					childPriceSum = add(childPriceSum, multiplication(priceList[i]['child_price'], rate));
				}
			}
			roomTotalPrice = priceSum;
			adultTotalPrice = adultPriceSum;
			childTotalPrice = childPriceSum;
		}
	}
	function redirectToCartPage(url) {
		window.location.href = url;
	}
	function getTimeStamp(date) {
		if (typeof date != 'undefined' && !date.getTime) {
			date = new Date();
		}
		return Math.floor(date.getTime() / dayTime / 1000) * dayTime;
	}
	function updateTotalPrice() {
		var roomPriceSum = loftoceanRoomReservation.pricePerPerson
			? add(multiplication(adultTotalPrice, adultNumber), multiplication(childTotalPrice, childNumber))
			: multiplication(roomTotalPrice, roomNumber);
		if ((false !== discounts) && discounts.totleDiscount) {
			originalTotalPrice = roomPriceSum;
			roomPriceSum = multiplication(roomPriceSum, discounts.totleDiscount);
		} else {
			originalTotalPrice = roomPriceSum;
		}
		finalRoomTotalPrice = roomPriceSum;

		updatePriceDetails();
	}
	function getRemotePriceList(startTime, endTime) {
		if (roomID && startTime && endTime) {
			$.ajax({
				url: wpApiSettings.root + 'loftocean/v1/get_room_availability/' + roomID + '/' + startTime + '/' + endTime,
				type: 'GET',
				success: function (data, status) {
					if (typeof data == "object") {
						data.forEach(function (item) {
							priceList[item['id']] = item;
						});
						calculateRoomTotalPrice();
						calculateExtraServiceTotalPrice();
						updateTotalPrice();
					}
				}, error: function (e) {
					alert(i18nText.getRemotePriceListErrorMessage);
				}
			});
		}
	}
	function checkOutputNumberFormat(num, ignoreSymbal) {
		var m = 0, tmpNum = 0, numStr = '', thousand = 1000;
		num = ('undefined' == typeof num) ? 0 : (isNumber(num) ? num : 0);
		try { m = ('' + num).split('.')[1].length; } catch (e) { m = 0; }
		num = Number(num).toFixed(m ? Math.max(0, loftoceanRoomReservation.currencySettings.precision) : 0);
		num = ('' + num).split('.');

		numStr = Number(num[0]);
		if (loftoceanRoomReservation.currencySettings.thousandSeparator) {
			tmpNum = Number(num[0]);
			if (tmpNum > thousand) {
				numStr = (tmpNum + '').substr(-3)
				tmpNum = Math.floor(tmpNum / thousand);
				while (tmpNum > thousand) {
					numStr = (tmpNum + '').substr(-3) + loftoceanRoomReservation.currencySettings.thousandSeparator + numStr;
					tmpNum = Math.floor(tmpNum / thousand);
				}
				if (tmpNum > 0) {
					numStr = tmpNum + loftoceanRoomReservation.currencySettings.thousandSeparator + numStr;
				}
			}
		}
		if ((num.length > 1) && (Number(num[1]) > 0) && loftoceanRoomReservation.currencySettings.precision && loftoceanRoomReservation.currencySettings.decimalSeparator) {
			numStr += loftoceanRoomReservation.currencySettings.decimalSeparator + num[1];
		}

		return ignoreSymbal ? numStr : loftoceanRoomReservation.currency['left'] + numStr + loftoceanRoomReservation.currency['right'];
	}
	function addLeadingZero(num) {
		return num > 9 ? num : '0' + num;
	}
	function getDateValue(date) {
		return date.getFullYear() + '-' + addLeadingZero(date.getMonth() + 1) + '-' + addLeadingZero(date.getDate());
	}

	function isNumber(value) {
		return (!isNaN(value)) && isFinite(value);
	}

	function add(arg1, arg2) {
		var m1, m2, m, sum = 0;
		try { m1 = ('' + arg1).split('.')[1].length; } catch (e) { m1 = 0; }
		try { m2 = ('' + arg2).split('.')[1].length; } catch (e) { m2 = 0; }
		m = Math.max(m1, m2);
		sum = (arg1 * Math.pow(10, m) + arg2 * Math.pow(10, m)) / Math.pow(10, m);
		return sum.toFixed(m);
	}
	function subtraction(arg1, arg2) {
		return add(arg1, (- arg2));
	}
	function multiplication(arg1, arg2) {
		var m1, m2, result = 0;
		try { m1 = ('' + arg1).split('.')[1].length; } catch (e) { m1 = 0; }
		try { m2 = ('' + arg2).split('.')[1].length; } catch (e) { m2 = 0; }
		result = (arg1 * Math.pow(10, m1)) * (arg2 * Math.pow(10, m2)) / Math.pow(10, (m1 + m2));
		return result.toFixed(m1 + m2);
	}

	function checkDateAvailability(date, drp) {
		date = date.format(dateFormat);
		if ((typeof drp === 'undefined' || null === drp.startDate || null !== drp.endDate) && disabledStartDates.includes(date)) {
			return [false, '', ''];
		} else {
			var notSetEndDateYet = (typeof drp !== 'undefined' && null !== drp.startDate && null === drp.endDate);
			if (notSetEndDateYet) {
				if (moment(date).isBefore(drp.startDate)) return [false, '', ''];

				if (disabledEndDates.length) {
					if (disabledEndDates.includes(date)) return [false, '', ''];

					var currentVerifyDate = drp.startDate.clone(), validEndDate = moment(date);
					currentVerifyDate.add('1', 'day');
					while (currentVerifyDate.isBefore(validEndDate)) {
						if (disabledStartDates.includes(currentVerifyDate.format(dateFormat))) {
							return [false, '', ''];
						}
						currentVerifyDate.add('1', 'day');
					}
				}
			}

			var d = new Date(date), dayOfWeek = 'day' + d.getDay(), currentTimstamp = getTimeStamp(d), classes = [], messages = [];
			if (loftoceanRoomReservation.unavailableDates) {
				if (loftoceanRoomReservation.unavailableDates['in_advance'] && loftoceanRoomReservation.unavailableDates['in_advance']['length']) {
					for (let i = 0; i < loftoceanRoomReservation.unavailableDates['in_advance'].length; i++) {
						let inAdvanceItem = loftoceanRoomReservation.unavailableDates['in_advance'][i];
						if (('all' == inAdvanceItem.id) || ((inAdvanceItem.start <= currentTimstamp) && (currentTimstamp <= inAdvanceItem.end))) {
							if (inAdvanceItem.min && (((currentTimstamp - todayTimestamp) / dayTime) < inAdvanceItem.min)) {
								classes.push('disabled', 'checkin-unavailable');
							}
							if (inAdvanceItem.max && (((currentTimstamp - todayTimestamp) / dayTime) > inAdvanceItem.max)) {
								classes.push('checkin-unavailable');
								if (('undefined' === typeof drp) || (null === drp.startDate || null !== drp.endDate)) {
									classes.push(' disabled');
								}
							}
							break;
						}
					}
				}
				if (loftoceanRoomReservation.unavailableDates.checkin && loftoceanRoomReservation.unavailableDates.checkin.length) {
					for (let i = 0; i < loftoceanRoomReservation.unavailableDates.checkin.length; i++) {
						let disabledCheckItem = loftoceanRoomReservation.unavailableDates.checkin[i];
						if (('all' == disabledCheckItem.id) || ((disabledCheckItem.start <= currentTimstamp) && (currentTimstamp <= disabledCheckItem.end))) {
							if (disabledCheckItem.days.includes(dayOfWeek)) {
								classes.push('no-checkin', 'checkin-unavailable');
								messages.push(i18nText.noCheckin);
							}
							break;
						}
					}
				}
				if (loftoceanRoomReservation.unavailableDates.checkout && loftoceanRoomReservation.unavailableDates.checkout.length) {
					for (let i = 0; i < loftoceanRoomReservation.unavailableDates.checkout.length; i++) {
						let disabledCheckItem = loftoceanRoomReservation.unavailableDates.checkout[i];
						if (('all' == disabledCheckItem.id) || ((disabledCheckItem.end >= currentTimstamp) && (currentTimstamp >= disabledCheckItem.start))) {
							if (disabledCheckItem.days.includes(dayOfWeek)) {
								classes.push('no-checkout', 'checkout-unavailable');
								messages.push(i18nText.noCheckout);
							}
							break;
						}
					}
				}
				if (notSetEndDateYet) {
					if (loftoceanRoomReservation.unavailableDates['stay_length'] && loftoceanRoomReservation.unavailableDates['stay_length']['length']) {
						var startDateTimestamp = getTimeStamp(new Date(drp.startDate.format(dateFormat)));
						if (currentTimstamp > startDateTimestamp) {
							for (let i = 0; i < loftoceanRoomReservation.unavailableDates['stay_length']['length']; i++) {
								let stayLengthItem = loftoceanRoomReservation.unavailableDates['stay_length'][i];
								if (('all' == stayLengthItem.id) || ((stayLengthItem.end >= startDateTimestamp) && (startDateTimestamp >= stayLengthItem.start))) {
									var daysAfterStart = (currentTimstamp - startDateTimestamp) / dayTime;
									if (stayLengthItem.rules[dayOfWeek]) {
										if (daysAfterStart < stayLengthItem.rules[dayOfWeek]['min']) {
											classes.push('minimal-stay-unavailable', 'checkout-unavailable');
											messages.push(stayLengthItem.rules[dayOfWeek]['min'] + i18nText.minimum);
										}
										if (daysAfterStart > stayLengthItem.rules[dayOfWeek]['max']) {
											classes.push('off', 'disabled', 'maximal-stay-unavailable', 'checkout-unavailable');
											messages.push(stayLengthItem.rules[dayOfWeek]['max'] + i18nText.maximum);
										}
									}
									break;
								}
							}
						}
					}
				}
			}
			return [true, classes.length ? classes.join(' ') : '', messages.length ? messages.join(', ') : ''];
		}
		return [true, '', ''];
	}

	function updateBookingDates(startDate, endDate) {
		$checkinDate.val(startDate);
		$checkoutDate.val(endDate);

		checkinDate = startDate;
		checkinTimestamp = getTimeStamp(new Date(startDate));
		checkoutDate = endDate;
		checkoutTimestamp = getTimeStamp(new Date(endDate));

		checkExtraServiceList(checkinTimestamp, checkoutTimestamp);
		checkFlexiblePriceRules();
	}
	function getDefaultAvailableDates(checkin, checkout) {
		var i = 0, j = 0, max = 70, currentStartDate = checkin.clone(), currentEndDate = null;
		while (i++ < max) {
			var startDateStatus = checkDateAvailability(currentStartDate);
			if ((!startDateStatus[0]) || (startDateStatus[1] && startDateStatus[1].split(' ').includes('checkin-unavailable'))) {
				currentStartDate.add('1', 'day');
				continue;
			}

			j = 0; currentEndDate = currentStartDate.clone().add('1', 'day');
			var checkoutValidationArgs = { 'startDate': currentStartDate, 'endDate': null };
			while (j++ < max) {
				var endDateStatus = checkDateAvailability(currentEndDate, checkoutValidationArgs);
				if ((!endDateStatus[0]) || (endDateStatus[1] && endDateStatus[1].split(' ').includes('checkout-unavailable'))) {
					currentEndDate.add('1', 'day');
					continue;
				}
				return { 'checkin': currentStartDate.format(dateFormat), 'checkout': currentEndDate.format(dateFormat) };
			}
			currentStartDate.add('1', 'day');
		}
		return { 'checkin': checkin.format(dateFormat), 'checkout': checkout.format(dateFormat) };
	}
	function checkExtraServiceList(checkin, checkout) {
		if (hasExtraServices && hasCustomExtraServices) {
			var currentList = [];
			hasCustomExtraServices = false;
			loftoceanRoomReservation.extraServices.forEach(function (item) {
				if (('' !== item.effective_time) && item.custom_effective_time_slots.length) {
					hasCustomExtraServices = true;
					var passDeactivated = true, isActivated = ('activated' == item.effective_time);
					for (let i = 0; i < item.custom_effective_time_slots.length; i++) {
						var cets = item.custom_effective_time_slots[i];
						if (((!cets.start_timestamp) || (cets.start_timestamp <= checkin))
							&& ((!cets.end_timstamp) || (cets.end_timstamp >= checkout))) {
							if (isActivated) {
								currentList.push($.extend({}, item));
							} else {
								passDeactivated = false;
							}
							break;
						}
					}
					if ((!isActivated) && passDeactivated) {
						currentList.push($.extend({}, item));
					}
				} else {
					currentList.push($.extend({}, item));
				}
			});
			var $extraServiceList = $('#secondary .cs-form-group.cs-extra-service-group');
			$extraServiceList.length ? $extraServiceList.remove() : '';
			if (currentList.length) {
				$totalPriceSection.before(extraServiceListTmpl({ 'currency': loftoceanRoomReservation.currency, 'services': currentList }));
			}
		}
	}
	function checkTaxes(price, data) {
		if (loftoceanRoomReservation.isTaxEnabled) {
			if (loftoceanRoomReservation.taxIncluded) {
				var taxes = calculate_included_tax(price);
				data.tax = checkOutputNumberFormat(taxes.totalTax);
				data.taxDetails = taxes.taxDetails;
			} else {
				var taxes = calculate_exclude_tax(price);
				data.tax = checkOutputNumberFormat(taxes.totalTax);
				data.taxDetails = taxes.taxDetails;
				data.beforeTax = data.totalPrice;
				data.totalPrice = checkOutputNumberFormat(add(data.totalOriginalPrice, taxes.totalTax), true);
			}
		}
	}
	function calculate_included_tax(price) {
		var precision = add(loftoceanRoomReservation.currencySettings.precision, 2),
			taxes = loftoceanRoomReservation.taxRate, taxDetails = [],
			priceBeforeTax = price, currentPrice = 0;
		if (taxes['reversed_compound_rates'] && taxes['reversed_compound_rates'].length) {
			for (var i = 0; i < taxes['reversed_compound_rates'].length; i++) {
				currentPrice = priceBeforeTax;
				priceBeforeTax = multiplication(priceBeforeTax, (100 / (100 + taxes['reversed_compound_rates'][i]['rate'])));
				priceBeforeTax = Number(priceBeforeTax).toFixed(precision);
				taxDetails.unshift({ 'tax': checkOutputNumberFormat(subtraction(currentPrice, priceBeforeTax)), 'label': taxes['reversed_compound_rates'][i]['label'] });
			}
		}
		if (taxes['regular_rates'] && taxes['regular_rates'].length) {
			var rateSum = 100;
			for (var i = 0; i < taxes['regular_rates'].length; i++) {
				rateSum = add(rateSum, taxes['regular_rates'][i]['rate']);
			}
			priceBeforeTax = multiplication(priceBeforeTax, 100 / rateSum);
			priceBeforeTax = Number(priceBeforeTax).toFixed(precision);

			for (i -= 1; i >= 0; i--) {
				taxDetails.push({ 'tax': checkOutputNumberFormat(multiplication(priceBeforeTax, taxes['regular_rates'][i]['rate'] / 100)), 'label': taxes['regular_rates'][i]['label'] });
			}
		}
		return { 'totalTax': subtraction(price, priceBeforeTax), 'taxDetails': taxDetails };
	}
	function calculate_exclude_tax(price) {
		var taxes = loftoceanRoomReservation.taxRate,
			priceForCompound = price, totalTax = 0,
			taxDetails = [];
		if (taxes['regular_rates'] && taxes['regular_rates'].length) {
			var currentTax = 0
			for (var i = 0; i < taxes['regular_rates'].length; i++) {
				currentTax = multiplication(price, (taxes['regular_rates'][i]['rate'] / 100));
				taxDetails.push({ 'tax': checkOutputNumberFormat(currentTax), 'label': taxes['regular_rates'][i]['label'] });
				totalTax = add(totalTax, currentTax);
			}
			priceForCompound = add(price, totalTax);
		}
		if (taxes['compound_rates'] && taxes['compound_rates'].length) {
			var compoundTax = 0;
			for (var i = 0; i < taxes['compound_rates'].length; i++) {
				compoundTax = multiplication(priceForCompound, (taxes['compound_rates'][i]['rate'] / 100));
				totalTax = add(totalTax, compoundTax);
				priceForCompound = add(priceForCompound, compoundTax);
				taxDetails.push({ 'tax': checkOutputNumberFormat(compoundTax), 'label': taxes['compound_rates'][i]['label'] });
			}
		}
		return { 'totalTax': totalTax, 'taxDetails': taxDetails };
	}

	document.addEventListener('DOMContentLoaded', function () {
		if ('undefined' == loftoceanRoomReservation) return false;

		$reservationForm = $('#secondary .cs-reservation-form');

		priceDetailsTmpl = wp.template('loftocean-room-price-details');
		extraServiceListTmpl = wp.template('loftocean-room-extra-services');
		hasExtraServices = loftoceanRoomReservation.extraServices && loftoceanRoomReservation.extraServices.length;
		hasCustomExtraServices = true;

		$basePrice = $('#secondary .base-price');
		$loading = $('#secondary .cs-room-booking');
		$priceDetails = $('#secondary .cs-form-price-details');

		$totalPriceSection = $reservationForm.find('.cs-form-total-price');
		$totalPrice = $totalPriceSection.find('.total-price-number');
		priceList = loftoceanRoomReservation.priceList;
		roomID = loftoceanRoomReservation.roomID;
		i18nText = loftoceanRoomReservation.i18nText;
		hasFlexibilePriceRules = !!loftoceanRoomReservation.hasFlexibilePriceRules;
		defaultCheckoutDate = new Date();
		defaultCheckoutDate.setDate(defaultCheckoutDate.getDate() + 1);
		defaultCheckoutTimeStamp = getTimeStamp(defaultCheckoutDate);
		defaultCheckoutDate = getDateValue(defaultCheckoutDate);

		$checkinDate = $reservationForm.find('.cs-check-in input[name=checkin]');
		$checkoutDate = $reservationForm.find('.cs-check-out input[name=checkout]');
		$roomNumber = $reservationForm.find('.cs-rooms input[name=room-quantity]');
		$adultNumber = $reservationForm.find('.cs-adults input[name=adult-quantity]');
		$childNumber = $reservationForm.find('.cs-children input[name=child-quantity]');

		$roomMessage = $reservationForm.find('.cs-form-field.cs-rooms > .cs-form-notice');
		$errorMessage = $reservationForm.children('.cs-form-error-message');
		$successMessage = $reservationForm.children('.cs-form-success-message');
		$availabilityCalendar = $('.room-availability-calendar-wrapper .hidden-calendar');
		hasAvailabilityCalendar = $availabilityCalendar.length;

		todayTimestamp = getTimeStamp('');
		$.each(loftoceanRoomReservation.priceList, function (i, item) {
			if (('unavailable' == item.status) || (item.available_number < 1)) {
				disabledStartDates.push(item.start);
				disabledEndDates.push(item.end);
			}
		});

		var defaultsDates = getDefaultAvailableDates(moment(), moment().add('1', 'day')),
			defaultStartDate = defaultsDates.checkin,
			defaultEndDate = defaultsDates.checkout;

		$checkinDate.val(defaultStartDate);
		$checkoutDate.val(defaultEndDate);
		checkinDate = defaultStartDate;
		checkinTimestamp = getTimeStamp(new Date(checkinDate));
		checkoutDate = defaultEndDate;
		checkoutTimestamp = getTimeStamp(new Date(checkoutDate));
		adultNumber = $adultNumber.val();
		childNumber = $childNumber.val();
		roomNumber = $roomNumber.val();
		roomTotalPrice = 0;
		adultTotalPrice = 0;
		childTotalPrice = 0;
		extraServiceTotalPrice = 0;

		var $dateRangePicker = $reservationForm.find('.date-range-picker');
		if (hasAvailabilityCalendar) {
			$availabilityCalendar.daterangepicker({
				parentEl: '.room-availability-calendar-wrapper',
				minDate: moment().format(dateFormat),
				maxDate: moment().add('1', 'year').format(dateFormat),
				startDate: defaultStartDate,
				endDate: defaultEndDate,
				alwaysShowCalendars: true,
				locale: { format: dateFormat },
				beforeShowDay: function (date, drp) {
					return checkDateAvailability(date, drp);
				}
			}).trigger('click').on('apply.daterangepicker', function (e, drp) {
				drp.show();
				var startDate = drp.startDate.format(dateFormat), endDate = drp.endDate.format(dateFormat);

				if ($reservationForm.length) {
					$dateRangePicker.val(startDate + ' - ' + endDate);
					updateBookingDates(startDate, endDate);

					$('html, body').animate({ scrollTop: $checkinDate.offset().top - window.innerHeight / 2 }, 200);
				}
			}).on('cancel.daterangepicker', function (e, drp) {
				drp.show();
				drp.setStartDate(defaultStartDate);
				drp.setEndDate(defaultEndDate);
				drp.updateView();
			}).on('outsideClick.daterangepicker', function (e, drp) { drp.show(); });
		}

		$('#content.site-content.with-sidebar-right').length ? $dateRangePicker.addClass('pull-right') : '';
		$dateRangePicker.daterangepicker({
			minDate: moment().format(dateFormat),
			maxDate: moment().add('1', 'year').format(dateFormat),
			startDate: defaultStartDate,
			endDate: defaultEndDate,
			locale: { format: dateFormat },
			autoApply: true,
			beforeShowDay: function (date, drp) {
				return checkDateAvailability(date, drp);
			}
		}).on('apply.daterangepicker', function (e, drp) {
			var startDate = drp.startDate.format(dateFormat), endDate = drp.endDate.format(dateFormat);
			$(this).val(startDate + ' - ' + endDate);
			updateBookingDates(startDate, endDate);

			if (hasAvailabilityCalendar) {
				var dateRangePicker = $availabilityCalendar.data('daterangepicker');
				dateRangePicker.setStartDate(startDate);
				dateRangePicker.setEndDate(endDate);
				dateRangePicker.updateView();
			}
		});
		$reservationForm.find('.checkin-date, .checkout-date').on('click', function (e) {
			var dateRangePicker = $dateRangePicker.data('daterangepicker'),
				tmpCurrentCheckin = moment($checkinDate.val() ? $checkinDate.val() : ''),
				tmpCurrentCheckout = moment($checkoutDate.val() ? $checkoutDate.val() : ''),
				currentDates, currentCheckinDate, currentCheckoutDate;

			tmpCurrentCheckin = tmpCurrentCheckin.isValid() ? tmpCurrentCheckin : moment();
			tmpCurrentCheckout = tmpCurrentCheckout.isAfter(tmpCurrentCheckin) ? tmpCurrentCheckout : tmpCurrentCheckin.clone().add('1', 'day');
			currentDates = getDefaultAvailableDates(tmpCurrentCheckin, tmpCurrentCheckout);
			currentCheckinDate = currentDates.checkin;
			currentCheckoutDate = currentDates.checkout;

			dateRangePicker.setStartDate(currentCheckinDate);
			dateRangePicker.setEndDate(currentCheckoutDate);
			dateRangePicker.show();
		});

		if ($priceDetails.length) {
			$totalPriceSection.on('click', function (e) {
				var $self = $(this);
				if ($priceDetails.hasClass('hide')) {
					$self.addClass('toggled-on');
					$priceDetails.removeClass('hide');
				} else {
					$self.removeClass('toggled-on');
					$priceDetails.addClass('hide');
				}
			});
		}
		$reservationForm.on('change', '.cs-form-group.cs-extra-service-group .label-checkbox .extra-service-switcher', function () {
			calculateExtraServiceTotalPrice();
			updateTotalPrice();
		}).on('click', '.cs-form-group.cs-extra-service-group .extra-service-custom-quantity button', function (e) {
			setTimeout(function () {
				calculateExtraServiceTotalPrice();
				updateTotalPrice();
			}, 50);
		});
		$roomNumber.parent().on('click', 'button', function (e) {
			$roomMessage.removeClass('show');
			clearTimeout(messageTimer);
			setTimeout(function () {
				roomNumber = $roomNumber.val();
				updateTotalPrice();
			}, 50);
		});
		$adultNumber.parent().on('click', 'button', function (e) {
			setTimeout(function () {
				adultNumber = $adultNumber.val();
				calculateRoomTotalPrice();
				calculateExtraServiceTotalPrice();
				updateTotalPrice();
				if (loftoceanRoomReservation.pricePerPerson) {
					updateLowestPrice();
				}
			}, 50);
		});
		$childNumber.parent().on('click', 'button', function (e) {
			setTimeout(function () {
				childNumber = $childNumber.val();
				calculateRoomTotalPrice();
				calculateExtraServiceTotalPrice();
				updateTotalPrice();
				if (loftoceanRoomReservation.pricePerPerson) {
					updateLowestPrice();
				}
			}, 50);
		});
		$('body').on('click', function (e) {
			var $target = $(e.target), $priceBreakdown = $('.csf-base-price-breakdown');
			if ($priceBreakdown.length && (!$target.hasClass('csf-base-price-breakdown')) && (!$target.parents('.csf-base-price-breakdown').length)) {
				$('.csf-base-price-breakdown').removeClass('show');
			}
		}).on('mouseenter', '.daterangepicker-has-tooltip', function () {
			var $toolTip = $(this).find('.day-tooltip');
			$toolTip.length ? $toolTip.removeClass('hide') : '';
		}).on('mouseleave', '.daterangepicker-has-tooltip', function () {
			var $toolTip = $(this).find('.day-tooltip');
			$toolTip.length ? $toolTip.addClass('hide') : '';
		});
		$reservationForm.on('click', '.csf-pd-total-base .csf-pd-label', function (e) {
			e.stopImmediatePropagation();
			e.stopPropagation();
			var $priceBreakdown = $(this).siblings('.csf-base-price-breakdown');
			$priceBreakdown.hasClass('show') ? '' : $priceBreakdown.addClass('show');
		}).on('click', '.cs-submit button', function (e) {
			e.preventDefault();
			var data = { 'roomID': loftoceanRoomReservation.roomID, 'action': loftoceanRoomReservation.addRoomToCartAjaxAction },
				options = $reservationForm.find('input,select,cheeckbox').serializeArray();
			options.forEach(function (option) {
				data[option['name']] = option['value'];
			});
			$errorMessage.html('');
			$successMessage.html('');
			$loading.addClass('loading');
			$.ajax(loftoceanRoomReservation.ajaxURL, { 'method': 'GET', 'data': data }).done(function (data, status) {
				var processed = false;
				if ('success' == status) {
					data = data ? JSON.parse(data) : {};
					if ('object' == typeof data) {
						if (data.message) {
							processed = true;
							$errorMessage.html('<p>' + data.message + '</p>');
						} else if (data.redirect) {
							processed = true;
							$successMessage.html('<p>' + i18nText.bookingSuccess + '</p>');
							setTimeout(function () {
								window.location.href = data.redirect;
							}, 500);
						}
					}
				}
				processed ? '' : $errorMessage.html('<p>' + i18nText.bookingError + '</p>');
			}).fail(function () {
				$errorMessage.html('<p>' + i18nText.bookingError + '</p>');
			}).always(function () {
				$loading.removeClass('loading');
			});
			return false;
		});

		checkExtraServiceList(checkinTimestamp, checkoutTimestamp);
		checkFlexiblePriceRules();
		$loading.removeClass('loading');
	});
})(jQuery);







