(function ($) {
"use strict";
var $roomihxxServices = $('.loftocean-room-ihxx-service-wrapper');
if ($roomihxxServices.length) {
var $addBtn = $roomihxxServices.find('.loftocean-room-ihxx-service-add'), tmpl = wp.template('loftocean-room-ihxx-service'),
$removedID = $roomihxxServices.siblings('[name=loftocean_room_ihxx_service_removed]'), $submit = $('.submit.loftocean-submit-button #submit'),
customTimeSlotTmpl = wp.template('loftocean-room-ihxx-service-custom-time-slot');

function addDefaultCustomFontItem() {
var $newItem = tmpl({
'index': $addBtn.data('current-index'), 'list': [{
'name': '',
'price': '',
'method': 'fixed',
'auto_method': '',
'custom_price_appendix_text': 'Per Person',
'custom_adult_price': '',
'custom_child_price': '',
'effective_time': '',
'custom_effective_time_slots': [],
'obligatory': '',
'term_id': ''
}]
});
if ($newItem) {
$newItem = $($newItem);
$addBtn.before($newItem);
initControls($newItem);
}
}
function addNewCustomTimeSlot($wrapper) {
var $newItem = customTimeSlotTmpl({ 'index': $wrapper.data('slot-count'), 'namePrefix': $wrapper.data('name-prefix') });
if ($newItem) {
$newItem = $($newItem);
$($wrapper).append($newItem);
initControls($newItem);
}
}
function initControls($item) {
if ($item && $item.length) {
var $datePicker = $item.find('.date-picker');
$datePicker.length ? $datePicker.persianDatepicker({ 'formatDate': 'YY-MM-DD', 'minDate': 0, showGregorianDate: true }) : '';
}
}

$roomihxxServices.on('click', '.loftocean-room-ihxx-service-item-remove', function (e) {
e.preventDefault();
var $item = $(this).closest('.loftocean-room-ihxx-service-item'),
$IDInput = $item.find('.service-item-id-hidden');
if ($IDInput.length && $IDInput.val()) {
var val = $IDInput.val(), oldIDs = $removedID.val(),
newIDs = oldIDs ? oldIDs.split(',') : [];
newIDs.push(val);
$removedID.val(newIDs.join(','));
}
$item.remove();
}).on('keyup', '.loftocean-room-ihxx-service-title', function (e) {
var $title = $(this).closest('.loftocean-room-ihxx-service-item').find('h3 .item-name'),
name = $(this).val();
if ($title.length) {
name ? $title.html(' - ' + name) : $title.html('');
}
}).on('change', '.loftocean-room-ihxx-service-method', function (e) {
var $wrap = $(this).closest('.control-wrapper'), $autoWrap = $wrap.siblings('.control-auto-calculated-item'),
$customWrap = $wrap.siblings('.control-custom-item'), $customPriceItems = $wrap.siblings('.control-auto-calculated-price-item');
switch ($(this).val()) {
case 'fixed':
$autoWrap.hide();
$customWrap.hide();
break;
case 'auto':
$autoWrap.show();
$customWrap.hide();
break;
case 'custom':
$autoWrap.hide();
$customWrap.show();
break;
}

if ($customPriceItems.length) {
('auto' == $(this).val()) && ['person', 'night-person'].includes($autoWrap.find('.loftocean-room-ihxx-service-auto-method').val()) ? $customPriceItems.show() : $customPriceItems.hide();
}
}).on('change', '.loftocean-room-ihxx-service-auto-method', function () {
var $self = $(this), $customPriceItems = $self.closest('.control-wrapper').siblings('.control-auto-calculated-price-item');
if ($customPriceItems.length) {
['person', 'night-person'].includes($self.val()) ? $customPriceItems.show() : $customPriceItems.hide();
}
}).on('change', '.effective-time', function () {
var $customSlotWrapper = $(this).closest('.controls-row').find('.custom-effective-time-slots-wrapper');
('' == $(this).val()) ? $customSlotWrapper.hide() : $customSlotWrapper.show();
}).on('click', '.custom-effective-time-slots-wrapper .add-custom-effective-time-slot', function (e) {
e.preventDefault();
var $wrapper = $(this).closest('.custom-effective-time-slots-wrapper');
$wrapper.data('slot-count', $wrapper.data('slot-count') + 1);
addNewCustomTimeSlot($wrapper);
return false;
}).on('click', '.custom-effective-time-slots-wrapper .delete-custom-effective-time-slot', function (e) {
e.preventDefault();
var $target = $(this).parent(), $wrapper = $target.parent();
$target.remove();
if (!$wrapper.children().length) {
$wrapper.data('slot-count', $wrapper.data('slot-count') + 1);
addNewCustomTimeSlot($wrapper);
}
return false;
});

$addBtn.on('click', function (e) {
e.preventDefault();
addDefaultCustomFontItem();
$addBtn.data('current-index', (1 + $addBtn.data('current-index')));
});

var currentihxxServices = loftoceanRoomihxxServices ? (Array.isArray(loftoceanRoomihxxServices) ? loftoceanRoomihxxServices : (typeof loftoceanRoomihxxServices == 'object' ? Object.values(loftoceanRoomihxxServices) : false)) : false;
if (currentihxxServices) {
var $newItems = tmpl({ 'index': 0, 'list': currentihxxServices });
if ($newItems) {
$newItems = $($newItems);
$addBtn.before($newItems);
$addBtn.data('current-index', currentihxxServices.length);
initControls($newItems);
}
}
$roomihxxServices.sortable({
'items': '> .loftocean-room-ihxx-service-item'
}).on('dblclick', '.loftocean-room-ihxx-service-item > h3', function (e) {
var $itemDetails = $(this).siblings('.loftocean-room-ihxx-service-controls-wrapper');
$itemDetails.length ? $itemDetails.toggle() : '';
});
$submit.length ? $submit.removeAttr('disabled').siblings('.spinner').css('visibility', 'hidden') : '';
}
})(jQuery);
