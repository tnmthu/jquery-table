$(document).ready(function(){

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
      width: "25%"
    },
    {
      colName: "Salary",
      dataName: "employee_salary",
      type: "number",
      width: "25%"
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
      if ($(row).hasClass("deleted") && !$(row).hasClass("added")) {
        const id = $(row).attr("id");
        ajaxReqs.push($.fn.delete(parseInt(id)));
      } else if ($(row).hasClass("added")) {
        let rowData = {
          id: $(row).attr("id"),
          employee_name: $(row).find("td.employee_name").html(),
          employee_salary: $(row).find("td.employee_salary").html(),
          employee_age: $(row).find("td.employee_age").html()
        };
        ajaxReqs.push($.fn.create(rowData));
      } else if ($(row).hasClass("edited")) {
        let rowData = {
          id: $(row).attr("id"),
          employee_name: $(row).find("td.employee_name").html(),
          employee_salary: $(row).find("td.employee_salary").html(),
          employee_age: $(row).find("td.employee_age").html()
        };
        ajaxReqs.push($.fn.update(rowData));
      }
    }

    $.when(...ajaxReqs).done(function(res) {
      $.fn.retrieve(function(res) {
        $("#test").table({
          data: res,
          width: "570px",
          columns: columns,
          pagination: {
            limit: 10
          }
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

  // BTN_ADD CLICKED
  $("#btn__add").click(function() {
    let name = $("#emp_name").val().trim();
    let sal = parseInt($("#emp_salary").val().trim());
    let age = parseInt($("#emp_age").val().trim());

    if (name == "" || sal == "" || age == "") {
      alert("Please fill in properly.")
    } else if ($.fn.isFloat(parseInt(age)) || 20 > parseInt(age) || 65 < parseInt(age)) {
      alert("Age must be an integer, > 20, < 65.");
    } else if (!$.fn.isMoney(parseInt(sal))) {
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
      $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
    }
  });

  // BTN_DEL CLICKED
  $("#btn__del").click(function() {
    $("#test").find("tbody tr input[type='checkbox']:checked").each(function() {
      $(this).trigger('click');
      $(this).closest("tr").addClass("deleted");
      $(this).closest("tr").prop("disabled", "disabled");
    });
  });

  // PASS TABLE DATA TO INPUT
  $('#test').on("click", "tbody input[type='checkbox']", function (e) {
    e.stopPropagation();
    if ($("#test").find($("tbody input:checkbox:checked")).length == 1) { 
      const id = $("#test").find($("tbody input:checkbox:checked")).closest("tr").attr("id") || null;
      let emp_name = $("#test").find($("tbody input:checkbox:checked")).closest("tr").find("td.employee_name").html();
      let emp_age = $("#test").find($("tbody input:checkbox:checked")).closest("tr").find("td.employee_age").html();
      let emp_sal = $("#test").find($("tbody input:checkbox:checked")).closest("tr").find("td.employee_salary").html();

      $("#emp_id").val(id);
      $("#emp_name").val(emp_name);
      $("#emp_age").val(emp_age);
      $("#emp_salary").val(emp_sal.replace(/,/g, ""));
      
    } else {
      $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
    }
  });

  // BTN_EDIT CLICKED
  $("#btn__edit").on("click", function() {
    let tr = $("#test").find($("tbody input:checkbox:checked")).closest("tr");
    if ($(tr).attr("changed")) {
      $(tr).addClass("edited");
      $(tr).removeAttr("changed")
      $(tr).find("td.employee_name").html($("#emp_name").val());
      $(tr).find("td.employee_age").html($("#emp_age").val());
      $(tr).find("td.employee_salary").html($("#emp_salary").val());
    
      $("#test").find("input:checkbox:checked").trigger('click');
    }
  });

  $("input").on("change paste keyup", function() {
    $("#test").find($("tbody input:checkbox:checked")).closest("tr").attr("changed", "1");
  });

  // SELECT ALL
  $("#test").on("click", "#select_all", function() {
    $('input:checkbox').not(this).prop('checked', this.checked);
    if ($(this).is(":checked")) {
      $('tbody input:checkbox').closest('tr').addClass("selected");
    } else {
      $('tbody input:checkbox').closest('tr').removeClass("selected");
    }
  });

  // CHECK ROW
  $('#test').on("click", "tbody tr", function(event) {
    $(this).find("input:checkbox").trigger('click');
  });


  $('#test').on("click", "tbody input[type='checkbox']", function (e) {
    e.stopPropagation();
    if ($(this).is(":checked")) { //If the checkbox is checked
        $(this).closest('tr').addClass("selected"); 
        //Add class on checkbox checked
    } else {
        $(this).closest('tr').removeClass("selected");
        //Remove class on checkbox uncheck
    }
    if ($("tbody input:checkbox:checked").length != $("tbody input:checkbox").length) {
      $("#select_all").prop('checked', false);
    } else {
      $("#select_all").prop('checked', true);
    }
  });
});