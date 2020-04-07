$(document).ready(function() {
  let columns = [
    {
      colName: "Id",
      dataName: "id",
      type: "number",
      width: "8%",
    },
    {
      colName: "Employee",
      dataName: "employee_name",
      type: "string",
      width: "40%",
    },
    {
      colName: "Age",
      dataName: "employee_age",
      type: "number",
      width: "15%"
    },
    {
      colName: "Salary",
      dataName: "employee_salary",
      type: "number",
      width: "35%"
    },
  ];

  // CREATE NEW EMP
  $.fn.create = function(emp) {
    $.ajax({
      url: "https://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo",
      type: "POST",
      data: emp
    }); 
  }

  // RETRIEVE ALL EMP
  $.fn.retrieve = function(handleData) {
    return $.ajax({
      url: 'https://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo',
      type: 'GET',
      success: function(res) {
        handleData(res);
      }
    });
  }

  // UPDATE EMP
  $.fn.update = function(emp) {
    return $.ajax({
      url: `https://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo/${emp.id}`,
      type: "PUT",
      data: emp
    });
  }

  // DELETE EMP
  $.fn.delete = function(id) {
    return $.ajax({
      url: `https://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo/${id}`,
      type: "DELETE"
    });
  }

  // SAVE ALL 
  $("#btn__save").on("click", function() {
    $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
    let rows = $("#test").find("table tbody tr");
    let ajaxReqs = [];
    for (let row of rows) {
      // if row deleted and not includes those just got added
      if ($(row).hasClass("deleted") && !$(row).hasClass("added")) {
        const id = $(row).attr("id");
        ajaxReqs.push($.fn.delete(parseInt(id)));
      } else if ($(row).hasClass("added")) { // row added or even can be edited
        let rowData = {
          id: $(row).attr("id"),
          employee_name: $(row).find("td.employee_name").html().replace(/\s\s+/g, " "),
          employee_salary: $(row).find("td.employee_salary").html().replace(/,/g, ""),
          employee_age: $(row).find("td.employee_age").html()
        };
        ajaxReqs.push($.fn.create(rowData));
      } else if ($(row).hasClass("edited")) { // row just got edited
        let rowData = {
          id: $(row).attr("id"),
          employee_name: $(row).find("td.employee_name").html().replace(/\s\s+/g, " "),
          employee_salary: $(row).find("td.employee_salary").html().replace(/,/g, ""),
          employee_age: $(row).find("td.employee_age").html()
        };
        ajaxReqs.push($.fn.update(rowData));
      }
    }

    if (ajaxReqs.length == 0) {
      return;
    }

    $.when(...ajaxReqs).done(function(result) {
      alert("Save done!");
      $.fn.retrieve(function(res) {
        $("#test").table({
          data: res,
          width: "50vw",
          columns: columns,
          pagination: {
            limit: 10
          },
          resizable: true,
          sort: true
        });
      });
    }).fail(function(err) {
      alert("Error saving!");
    });
  })

  // UTILITIES
  $.fn.isInt = function(n) {
    return Number(n) === n && n % 1 === 0;
  }
  $.fn.isFloat = function(n) {
    return Number(n) === n && n % 1 !== 0;
  }
  $.fn.isMoney = function(n) {
    let regex = /^[0-9]{1,3}([0-9]{3})*$/;
    return regex.test(n);
  }
  $.fn.removeAscent = function(str) {
    if (str === null || str === undefined) return str;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
  }
  $.fn.isName = function(s) {
    let regex = /^[a-zA-Z ]+$/;
    return regex.test($.fn.removeAscent(s));
  }
  $.fn.includeEe = function(s) {
    let regex = /[eE+-]/g;
    return regex.test(s);
  }
  $.fn.validated = function(name, sal, age) {
    let isValid = true;
    if (name === "" || !$.fn.isName(name)) {
      $("#emp_name").css("border-color", "red");
      $("#emp_name_msg").html("Wrong name format.");
      isValid = false;
    } 
    if (sal === "" || !$.fn.isMoney(sal)) {
      $("#emp_salary").css("border-color", "red");
      $("#emp_salary_msg").html("Salary must be in money type. Eg. 1000000");
      isValid = false;
    } 
    if (age === "" || $.fn.includeEe(age) || $.fn.isFloat(age) || 20 > age || 65 < age) {
      $("#emp_age").css("border-color", "red");
      $("#emp_age_msg").html("Age must be an integer, > 20, < 65.");
      isValid = false;
    }
    return isValid;
  }

  // BTN_ADD CLICKED
  let cnt = 0;
  $("#btn__add").click(function() {
    let name = $("#emp_name").val().trim();
    let sal = $("#emp_salary").val().trim();
    let age = $("#emp_age").val().trim();

    if (!$.fn.validated(name, sal, age)) {
      return;
    } else {
      $("#emp_name, #emp_age, #emp_salary").css("border-color", "#979797");
      $("#emp_name_msg, #emp_age_msg, #emp_salary_msg").html("");
      $("#test").find("table tbody").prepend(`
        <tr class="added">
          <td>
            <input class="checkbox" type="checkbox" id="select_${cnt}">
            <label for="select_${cnt}"></label>
          </td>
          <td class="id"></td>
          <td class="employee_name">${name}</td>
          <td class="employee_age">${parseInt(age)}</td>
          <td class="employee_salary">${parseInt(sal).toLocaleString("en")}</td>
        </tr>
      `);
      cnt++;
    }
  });

  // BTN_DEL CLICKED
  $("#btn__del").click(function() {
    $("#test").find("tbody tr input[type='checkbox']:checked").each(function() {
      $(this).trigger('click'); // uncheck row
      $(this).attr("disabled", true); // disable checkbox
      $(this).closest("tr").removeClass("selected").removeAttr("clicked").addClass("deleted");
      $(this).closest("tr").find("td").prop("disabled", true); // disable row
      $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
    });
  });

  // PASS TABLE DATA TO INPUT
  $("#test").on("click", "tbody tr td:not(:first-child)", function() {
    // clicked flag
    if ($(this).closest("tr").attr("clicked")) { // if is being selected -> unselect
      if ($(this).closest("tr").find("input[type='checkbox']:checked").length > 0) { // if checkbox is checked -> keep selected but not on form
        $(this).closest("tr").removeAttr("clicked");
      } else { // else: remove selected and clicked 
        $(this).closest("tr").removeAttr("clicked");
        $(this).closest("tr").removeClass("selected");
      }
    } else { // other rows are unselected, except the ones with checked checkboxes
      let checked = $("tbody tr").filter(':has(:checkbox:checked)');
      $(this).closest("tr").attr("clicked", 1);
      $(this).closest("tr").siblings().removeAttr("clicked");
      $(this).closest("tr").siblings().not(checked).removeClass("selected");
      $(this).closest("tr").addClass("selected");
    }

    if ($("#test").find("tbody tr[clicked=1]").length == 1) {
      let tr = $("#test").find("tbody tr[clicked=1]");
      const id = tr.attr("id") || null; // null for editing newly added rows
      let emp_name = tr.find("td.employee_name").html();
      let emp_age = tr.find("td.employee_age").html();
      let emp_sal = tr.find("td.employee_salary").html();

      $("#emp_id").val(id);
      $("#emp_name").val(emp_name);
      $("#emp_age").val(emp_age);
      $("#emp_salary").val(emp_sal.replace(/,/g, "") || null); // remove money format
    } 
    else {
      $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
    }
  });

  // EDITED
  $("input").on("input", function() {
    $("#test").find($("tbody tr[clicked=1]")).attr("changed", "1");
    let tr = $("#test").find($("tbody tr[clicked=1]"));
    // only 1 row selected
    if ($(tr).attr("changed")) {  
      let name = $("#emp_name").val().trim();
      let age = $("#emp_age").val().trim();
      let sal = $("#emp_salary").val().trim();

      if (!$.fn.validated(name, sal, age)) {
        return;
      } else {
        $("#emp_name, #emp_age, #emp_salary").css("border-color", "#979797");
        $(".msg").html("");

        $(tr).find("td.employee_name").html(name);
        $(tr).find("td.employee_age").html(age);
        $(tr).find("td.employee_salary").html(parseInt(sal).toLocaleString("en"));
      
        $(tr).addClass("edited");
      }
    } 
  });

  // SELECT ALL
  $("#test").on("click", "#select_all", function() {
    // ignore header checkbox and deleted rows
    let ignore = $("#test").find("tbody tr.deleted input:checkbox, input:checkbox:eq(0)") || null;
    // check all checkboxes
    $(`input:checkbox`).not(ignore).prop('checked', this.checked);
    if ($(this).is(":checked")) {
      $('tbody input:checkbox:checked').closest("tr").addClass("selected");
    } else {
      let clicked = $("tbody tr").filter('[clicked=1]'); // leave the clicked aloneee
      $('tbody input:checkbox').closest("tr").not(clicked).removeClass("selected");
    }
  });

  $('#test').on("click", "tbody input[type='checkbox']", function (e) {
    e.stopPropagation();
    if ($(this).is(":checked")) { // if the checkbox is checked
      $(this).closest('tr').addClass("selected"); // add class on checkbox checked
    } else {
      if (!$(this).closest('tr').attr("clicked")) { // if not currently clicked for form
        $(this).closest('tr').removeClass("selected"); // remove class on checkbox uncheck
      }
    }
    // if not all rows checked -> remove check all
    if ($("tbody input:checkbox:checked").length != $("tbody input:checkbox").length) {
      $("#select_all").prop('checked', false);
    } else {
      $("#select_all").prop('checked', true);
    }
  });
});