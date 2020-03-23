$(document).ready(function(){
  // get all emp
  $.fn.getAllEmp = function() {
    $.ajax({
      url: "http://5b0f708f3c5c110014145cc9.mockapi.io/api/nexacro-demo",
      type: "GET",
      success: function(res) {
        $("#table tbody").empty();
        for (let i = 0, n = res.length; i < n; i++) {
          $("#table tbody").append(`<tr id="${res[i]["id"]}">
          <td>
            <input type="checkbox" id="select_${i}" value="select_${i}">
          </td>
          <td class="id">${res[i]["id"]}</td>
          <td class="name">${res[i]["employee_name"]}</td>
          <td class="age">${res[i]["employee_age"]}</td>
          <td class="salary">${res[i]["employee_salary"]}</td>
          </tr>`)
        }
      },
      error: function() {
        console.log("error fetch all");
      }
    });
  }
  $.fn.getAllEmp();  

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
          $.fn.getAllEmp();
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
          $.fn.getAllEmp();
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
          $.fn.getAllEmp();
        },
        error: function(err) {
          console.log("edit error", err);
        }
      });
    })
  })


  $("#btn__add").click(function() {
    let values = {
      employee_name: $("#emp_name").val(),
      employee_salary: $("#emp_salary").val(),
      employee_age: $("#emp_age").val(),
    }
    addedEmps.push(values);
    $("#table tbody").prepend(`<tr>
          <td>
            <input type="checkbox">
          </td>
          <td></td>
          <td>${values["employee_name"]}</td>
          <td>${values["employee_age"]}</td>
          <td>${values["employee_salary"]}</td>
          </tr>`);
  });

  // delete row
  $("#btn__del").click(function() {
    $("tbody tr input[type='checkbox']:checked").each(function() {
      $(this).closest("tr").addClass("deleted");
      $(this).closest("tr").prop("disabled", "disabled");
      deletedEmpIds.push($(this).closest("tr").attr("id"));
    })

    $("tbody").on("click", "tr", function(e) {
      if ($(this).is(":checked")) {
        $(this).addClass("deleted");
      }
    })
  })

  // update emp info
  $('tbody').on("click", "input[type='checkbox']", function (e) {
    e.stopPropagation();
    if ($("tbody input:checkbox:checked").length == 1) { 
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
          $("tbody input:checkbox:checked").closest("tr").addClass("added");
          $("tbody input:checkbox:checked").closest("tr").find("td.name").html($("#emp_name").val());
          $("tbody input:checkbox:checked").closest("tr").find("td.age").html($("#emp_age").val());
          $("tbody input:checkbox:checked").closest("tr").find("td.salary").html($("#emp_salary").val());

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