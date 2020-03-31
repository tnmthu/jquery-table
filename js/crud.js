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

    $.when(...ajaxReqs).done(function(result) {
      $.fn.retrieve(function(res) {
        $("#test").table({
          data: res,
          width: "570px",
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
    let regex = /^[0-9]{1,3}([0-9]{3})+$/;
    return (regex.test(n)) ? true : false;
  }
  $.fn.isName = function(s) {
    let regex = /^[a-zA-Z ]+$/;
    return (regex.test(s)) ? true : false;
  }
  $.fn.includeEe = function(s) {
    let regex = /[eE+-]/g;
    return (regex.test(s)) ? true : false;
  }

  // BTN_ADD CLICKED
  $("#btn__add").click(function() {
    let name = $("#emp_name").val().trim();
    let sal = parseInt($("#emp_salary").val().trim());
    let age = parseInt($("#emp_age").val().trim());

    // validating inputs
    if (name == "" || sal == "" || age == "") {
      alert("Please fill in properly.")
    } else if ($.fn.includeEe(age) || $.fn.isFloat(age) || 20 > age || 65 < age) {
      alert("Age must be an integer, > 20, < 65.");
    } else if (!$.fn.isMoney(sal)) {
      alert("Salary must be in money type. Eg. 1000000");
    } else if (!$.fn.isName(name)) {
      alert("Wrong name format.");
    } else {
      $("#test").find("table tbody").prepend(`
        <tr class="added">
          <td>
            <input type="checkbox">
          </td>
          <td class="id"></td>
          <td class="employee_name">${name}</td>
          <td class="employee_age">${age}</td>
          <td class="employee_salary">${sal.toLocaleString("en")}</td>
        </tr>
      `);
      $("#emp_id, #emp_name, #emp_age, #emp_salary").val(""); // empty out inputs
      $("#test").find("input:checkbox:checked").trigger('click'); // uncheck row
    }
  });

  // BTN_DEL CLICKED
  $("#btn__del").click(function() {
    $("#emp_id, #emp_name, #emp_age, #emp_salary").val(""); // empty out inputs
    $("#test").find("tbody tr input[type='checkbox']:checked").each(function() {
      $(this).trigger('click'); // uncheck row
      $(this).closest("tr").find("td:gt(0)").removeClass("selected");
      $(this).closest("tr").addClass("deleted");
      $(this).closest("tr").prop("disabled", true); // disable row
    });
  });

  // PASS TABLE DATA TO INPUT
  $("#test").on("click", "tbody tr td:not(:first-child)", function() {
    // clicked flag
    if ($(this).closest("tr").attr("clicked")) {
      $(this).closest("tr").removeAttr("clicked");
      $(this).closest("tr").find("td:gt(0)").removeClass("selected");
    } else {
      $(this).closest("tr").attr("clicked", 1);
      $(this).closest("tr").find("td:not(:first-child)").addClass("selected");
    }

    if ($("#test").find("tbody tr[clicked=1]").length == 1) {
      let tr = $("#test").find("tbody tr[clicked=1]");
      $("#emp_id, #emp_name, #emp_age").prop("disabled", false); // allow inputs
      const id = tr.attr("id") || null; // null for editing newly added rows
      let emp_name = tr.find("td.employee_name").html();
      let emp_age = tr.find("td.employee_age").html();
      let emp_sal = tr.find("td.employee_salary").html();

      $("#emp_id").val(id);
      $("#emp_name").val(emp_name);
      $("#emp_age").val(emp_age);
      $("#emp_salary").val(emp_sal.replace(/,/g, "") || null); // remove money format
    } else {
      $("#emp_id, #emp_name, #emp_age, #emp_salary").prop("disabled", false);
      $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
    }
  });

  // BTN_EDIT CLICKED
  $("#btn__edit").on("click", function() {
    let tr = $("#test").find($("tbody tr[clicked=1]"));
    // only 1 row selected
    if ($(tr).attr("changed")) {  
      let name = $("#emp_name").val().trim();
      let age = $("#emp_age").val().trim();
      let sal = $("#emp_salary").val().trim();

      // validating inputs
      if ($.fn.isFloat(parseInt(age)) || 20 > parseInt(age) || 65 < parseInt(age)) {
        alert("Age must be an integer, > 20, < 65.");
      } else if (!$.fn.isMoney(parseInt(sal))) {
        alert("Salary must be in money type. Eg. 1000000");
      } else if (!$.fn.isName(name)) {
        alert("Wrong name format.");
      } else {
        $(tr).find("td.employee_name").html(name);
        $(tr).find("td.employee_age").html(age);
        $(tr).find("td.employee_salary").html(parseInt(sal).toLocaleString("en"));
      
        $(tr).addClass("edited");
        $(tr).find("td:gt(0)").removeClass("selected");
        $(tr).removeAttr("changed, clicked");

        $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
      }
    } 
  });
  // add flag for input change
  $("input").on("change paste keyup", function() {
    $("#test").find($("tbody tr[clicked=1]")).attr("changed", "1");
  });

  // SELECT ALL
  $("#test").on("click", "#select_all", function() {
    // ignore header checkbox and deleted rows
    let ignore = $("#test").find("tbody tr.deleted input:checkbox, input:checkbox:eq(0)") || null;
    // check all checkboxes
    $(`input:checkbox`).not(ignore).prop('checked', this.checked);
    if ($(this).is(":checked")) {
      $('tbody input:checkbox:checked').closest("td").addClass("selected");
      $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
    } else {
      $('tbody input:checkbox').closest("td").removeClass("selected");
    }
  });

  // CHECK ROW
  // $('#test').on("click", "tbody tr", function(event) {
  //   $(this).find("input:checkbox").trigger('click');
  // });

  $('#test').on("click", "tbody input[type='checkbox']", function (e) {
    e.stopPropagation();
    if ($(this).is(":checked")) { // if the checkbox is checked
        $(this).closest('td').addClass("selected"); 
        // add class on checkbox checked
    } else {
        $(this).closest('td').removeClass("selected");
        // remove class on checkbox uncheck
    }
    // if not all rows checked -> remove check all
    if ($("tbody input:checkbox:checked").length != $("tbody input:checkbox").length) {
      $("#select_all").prop('checked', false);
    } else {
      $("#select_all").prop('checked', true);
    }
  });
});