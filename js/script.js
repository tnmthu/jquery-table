$(document).ready(function() {
  // select all checkbox
  $("#select_all").click(function() {
    $('input:checkbox').not(this).prop('checked', this.checked);
    if ($(this).is(":checked")) {
      $('tbody input:checkbox').closest('tr').addClass("highlight");
    } else {
      $('tbody input:checkbox').closest('tr').removeClass("highlight");
    }
  });

  // check row
  $('tbody').on("click", "tr", function(event) {
    $(this).find("input:checkbox").trigger('click');
  });

  $('tbody').on("click", "input[type='checkbox']", function (e) {
    e.stopPropagation();
    if ($(this).is(":checked")) { //If the checkbox is checked
        $(this).closest('tr').addClass("highlight"); 
        //Add class on checkbox checked
    } else {
        $(this).closest('tr').removeClass("highlight");
        //Remove class on checkbox uncheck
    }
    if ($("tbody input:checkbox:checked").length != $("tbody input:checkbox").length) {
      $("#select_all").prop('checked', false);
    } else {
      $("#select_all").prop('checked', true);
    }
  });
});