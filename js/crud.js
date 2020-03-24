$(document).ready(function(){
  // get all emp
  $.fn.getAllEmp2 = function(handleData) {
    $.ajax({
      url: "http://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo",
      type: "GET",
      success: function(res) {
        handleData(res);
      }
    });
  }

  let addedEmps = [];
  let deletedEmpIds = [];
  let editedEmps = [];

  $("#btn__save").click(function(){
    addedEmps.forEach(elem => {
      $.ajax({
        url: "http://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo",
        type: "POST",
        data: elem,
        success: function() {
          $.fn.getAllEmp2(function(res) {
            $("#test").table(res);
          });
        },
        error: function() {
          console.log("error save add");
        }
      }); 
    });

    deletedEmpIds.forEach(id => {
      $.ajax({
        url: `http://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo/${id}`,
        type: "DELETE",
        success: function() {
          console.log("delete success");
          $.fn.getAllEmp2(function(res) {
            $("#test").table(res);
          });
        },
        error: function() {
          console.log("error save delete");
        }
      });
    });

    editedEmps.forEach(emp => {
      $.ajax({
        url: `http://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo/${emp.id}`,
        type: "PUT",
        data: emp,
        success: function(res) {
          $.fn.getAllEmp2(function(res) {
            $("#test").table(res);
          });        },
        error: function(err) {
          console.log("edit error", err);
        }
      });
    });
  });

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

  // add new emp
  $("#btn__add").click(function() {
    let name = $("#emp_name").val();
    let sal = $("#emp_salary").val();
    let age = $("#emp_age").val();
    if (name == "" || sal == "" || age == "") {
      alert("Please fill in properly.")
    } else if ($.fn.isFloat(parseInt(age)) || 20 > parseInt(age) || 65 < parseInt(age)) {
      alert("Age must be an integer, > 20, < 65.");
    } else if (!$.fn.isMoney(parseInt(sal))) {
      alert("Salary must be in money type. Eg. 1000000");
    } else if (!$.fn.isName(name)) {
      alert("Wrong name format.");
    } else {
      let values = {
        employee_name: name,
        employee_salary: sal,
        employee_age: age
      };
      addedEmps.push(values);
      $("#test").find("table tbody").prepend(`
        <tr>
          <td>
            <input type="checkbox">
          </td>
          <td></td>
          <td>${values["employee_name"]}</td>
          <td>${values["employee_age"]}</td>
          <td>${values["employee_salary"]}</td>
        </tr>
      `);
    }
  });

  // delete row
  $("#btn__del").click(function() {
    $("#test").find("tbody tr input[type='checkbox']:checked").each(function() {
      $(this).closest("tr").addClass("deleted");
      $(this).closest("tr").prop("disabled", "disabled");
      deletedEmpIds.push($(this).closest("tr").attr("id"));
    })

    $("#test").on("click", "tbody tr", function(e) {
      if ($(this).is(":checked")) {
        $(this).addClass("deleted");
      }
    })
  })

  // update emp info
  $('#test').on("click", "tbody input[type='checkbox']", function (e) {
    e.stopPropagation();
    if ($("#test").find($("tbody input:checkbox:checked")).length == 1) { 
      const id = $("tbody input:checkbox:checked").closest("tr").attr("id");
      const emp_name = $("tbody input:checkbox:checked").closest("tr").find("td.name").html();
      const emp_age = $("tbody input:checkbox:checked").closest("tr").find("td.age").html();
      const emp_sal = $("tbody input:checkbox:checked").closest("tr").find("td.salary").html();

      $("#emp_id").val(id);
      $("#emp_name").val(emp_name);
      $("#emp_age").val(emp_age);
      $("#emp_salary").val(emp_sal);
      
      $("#form input").on("change", function() {
        $("#btn__edit").on("click", function() {
          $("#test").find($("tbody input:checkbox:checked")).closest("tr").addClass("added");
          $("#test").find($("tbody input:checkbox:checked")).closest("tr").find("td.name").html($("#emp_name").val());
          $("#test").find($("tbody input:checkbox:checked")).closest("tr").find("td.age").html($("#emp_age").val());
          $("#test").find($("tbody input:checkbox:checked")).closest("tr").find("td.salary").html($("#emp_salary").val());

          editedEmps.push({
            id: id,
            employee_name: $("tbody input:checkbox:checked").closest("tr").find("td.name").html(),
            employee_salary: $("tbody input:checkbox:checked").closest("tr").find("td.salary").html(),
            employee_age: $("tbody input:checkbox:checked").closest("tr").find("td.age").html()
          });
        })
      })
    } else {
      $("#emp_id, #emp_name, #emp_age, #emp_salary").val("");
    }
  });



  $("#test").on("click", "#select_all", function() {
    console.log("asdfghjkl;");
  })

  // select all checkbox
  $("#test").on("click", "#select_all", function() {
    $('input:checkbox').not(this).prop('checked', this.checked);
    if ($(this).is(":checked")) {
      $('tbody input:checkbox').closest('tr').addClass("highlight");
    } else {
      $('tbody input:checkbox').closest('tr').removeClass("highlight");
    }
  });

  // check row
  $('#test').on("click", "tbody tr", function(event) {
    $(this).find("input:checkbox").trigger('click');
  });

  $('#test').on("click", "tbody input[type='checkbox']", function (e) {
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