jQuery(document).ready(function($) {

    //-----------------------------------------------------
    // Your jQuery Code Goes Here
    //-----------------------------------------------------

  	$('.cs-check-in input[name="checkin"]').after('<input type="text" class="check-in-date-show" placeholder="" value="" readonly>');
  	$('.cs-check-out input[name="checkout"]').after('<input type="text" class="check-out-date-show" placeholder="" value="" readonly>');
  	$('input[name="checkin"], input[name="checkout"]').hide();
  	var jalaliMoment = moment;

  	window.addEventListener('elementor/frontend/init', ()=>{
      elementorFrontend.on('components:init', ()=>{
        
        setTimeout(function(){
              var $dateRangePicker = $('.date-range-picker');
          		$dateRangePicker.jalaali = true;
        	  console.log($dateRangePicker.data('daterangepicker'))    
        }, 5000)
        
        function customRegisterReservationForm($reservationForm) {
          
          if (!$reservationForm.length) return;
          var dateFormat = $reservationForm.data('date-format') ? $reservationForm.data('date-format') : 'jYYYY/jMM/jDD',
              $checkinDate = $reservationForm.find('.checkin-date input[name="checkin"]'), $checkoutDate = $reservationForm.find('.checkout-date input'),
              $dateRangePicker = $reservationForm.find('.date-range-picker');
          true ? $dateRangePicker.addClass('pull-right') : '';
          if ($checkinDate.length && $checkoutDate.length) {
              var inPopup = $reservationForm.closest('.cs-button-popup').length,
                  checkinDate = moment().format(dateFormat), checkoutDate = moment().add(1, 'day').format(dateFormat),
                  pickerArgs = {
                      minDate: checkinDate,
                      startDate: checkinDate,
                      endDate: checkoutDate,
                      locale: { format: dateFormat },
                      autoApply: true,
                      jalaali: true,
                      language: 'fa',
                  };
              if (inPopup) {
                  pickerArgs.parentEl = $reservationForm.closest('.elementor-widget-container');
                  pickerArgs.linkedCalendars = false;
              }
              $checkinDate.val(checkinDate);
              $checkoutDate.val(checkoutDate);
              $dateRangePicker.daterangepicker(pickerArgs).on('apply.daterangepicker', function (e, drp) {
                  var startDate = drp.startDate.format(dateFormat), endDate = drp.endDate.format(dateFormat);
                  $(this).val(startDate + ' - ' + endDate);
                  $checkinDate.val(startDate);
                  $checkoutDate.val(endDate);
                  // Convert the Jalali dates to Gregorian for further processing if needed
     	 		  var jalaliStartDate = jalaliMoment(startDate, dateFormat).locale('fa').format('jYYYY-jMM-jDD');
      			  var jalaliEndDate = jalaliMoment(endDate, dateFormat).locale('fa').format('jYYYY-jMM-jDD');
                  $('.check-in-date-show').val(jalaliStartDate);
                  $('.check-out-date-show').val(jalaliEndDate);
                	
				  
              }).on('show.daterangepicker', function (e, drp) {
                  if (inPopup) {
                      $(drp.container).addClass('single').find('.calendar.right').hide();
                  }
              });
              $reservationForm.find('.checkin-date, .checkout-date').on('click', function (e) {
                  var dateRangePicker = $dateRangePicker.data('daterangepicker');
                  dateRangePicker.setStartDate($checkinDate.val());
                  dateRangePicker.setEndDate($checkoutDate.val());
                  dateRangePicker.show();
              });
          }

          $reservationForm.on('click', '.has-dropdown', function (e) {
              e.preventDefault();

              var $dropdown = $(this).siblings('.csf-dropdown');
              if ($dropdown.length) {
                  if ($dropdown.hasClass('is-open')) {
                      $dropdown.removeClass('is-open');
                  } else {
                      $('.csf-dropdown').removeClass('is-open');
                      $dropdown.addClass('is-open');
                  }
              }
          }).on('submit', function (e) {
              var $quantities = $reservationForm.find('.quantity.cs-quantity');
              if ($quantities.length) {
                  $quantities.each(function (e) {
                      var $item = $(this);
                      if ($item.data('label')) {
                          var currentValue = $item.find('input').val(),
                              $itemInput = $reservationForm.find('input[type="hidden"][name="' + $item.data('label') + '_quantity_label"]').length
                                  ? $reservationForm.find('input[type="hidden"][name="' + $item.data('label') + '_quantity_label"]')
                                  : $('<input>', { 'type': 'hidden', 'name': $item.data('label') + '_quantity_label' }).appendTo($reservationForm);
                          if (currentValue && (currentValue > 0)) {
                              $itemInput.val(currentValue + ' ' + loftoceanElementorFront['reservation'][$item.data('label')][(currentValue < 2) ? 'single' : 'plural']);
                          } else {
                              $itemInput.val('');
                          }
                      }
                  });
              }
          });
          $('.check-in-date-show, .check-out-date-show').val('');
      }
        
		elementorFrontend.hooks.removeAction('frontend/element_ready/cs_reservation.default');
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_reservation.default', function ($scope) {
            var $reservationForm = $scope.find('.cs-form-wrap');
            if ($reservationForm.length) {
                customRegisterReservationForm($reservationForm);
            }
          
        });
      });
    })

});





