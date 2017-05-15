/**
 * Created by 502669124 on 5/1/2017.
 */
function doo() {
    $.ajax({
        url: 'https://intelligent-mapping-prod.run.aws-usw02-pr.ice.predix.io/v1/collections',
        headers: {
            'Predix-Zone-Id': 'e76a98fc-f79a-4d7c-bae2-51655309e32c',
            'X-Subtenant-Id': 'e76a98fc-f79a-4d7c-bae2-51655309e32c',
            'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImxlZ2FjeS10b2tlbi1rZXkiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiJkODY3MGFkYmY3MzQ0YTY1YWE1MzgwNGM4ZGViMTgwYSIsInN1YiI6ImFkbWluIiwic2NvcGUiOlsiY2xpZW50cy5yZWFkIiwiem9uZXMuMTM2NjU5YmMtY2RkMS00ZjkyLWFmM2ItNTY4MGMwNjU2NGY4LmFkbWluIiwiY2xpZW50cy5zZWNyZXQiLCJpZHBzLndyaXRlIiwidWFhLnJlc291cmNlIiwiY2xpZW50cy53cml0ZSIsImNsaWVudHMuYWRtaW4iLCJpZHBzLnJlYWQiLCJzY2ltLndyaXRlIiwic2NpbS5yZWFkIl0sImNsaWVudF9pZCI6ImFkbWluIiwiY2lkIjoiYWRtaW4iLCJhenAiOiJhZG1pbiIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiZDY5ZWRjNTUiLCJpYXQiOjE0OTM2MjkwNTIsImV4cCI6MTQ5MzY3MjI1MiwiaXNzIjoiaHR0cHM6Ly9paW1vdDAyLnByZWRpeC11YWEucnVuLmF3cy11c3cwMi1wci5pY2UucHJlZGl4LmlvL29hdXRoL3Rva2VuIiwiemlkIjoiMTM2NjU5YmMtY2RkMS00ZjkyLWFmM2ItNTY4MGMwNjU2NGY4IiwiYXVkIjpbInNjaW0iLCJjbGllbnRzIiwidWFhIiwiYWRtaW4iLCJ6b25lcy4xMzY2NTliYy1jZGQxLTRmOTItYWYzYi01NjgwYzA2NTY0ZjgiLCJpZHBzIl19.Nl1zOfVKJNWCN6k1I-mhcfSMSsUhxiYOJGsxN9YRJll3vLncE4yOiEaA0ApA2f-jSm9L5aXHvPP6Vac5LqFM82MO2U0yqsxEu7Mtqyxcc3I7eb5mp5MS9-jOZnuDNII4BFS-RUox9oUjp2XzZviNBMosxU2sUVpstIZQDKAalfNn13BChTjkD9btisWu-D8RHs2ivA86U0Gdy8yRBnw1zpUjhutuKyL4W_K6YOmLQxqIZgeITgSgQs3aRr16pR-1feKBNX_0HHgHUK3iBQeElIZhs-QYLyGkQGfJpcvyn6vcdHrzUUoYiFrZz_iSdjsih3ZI4UFikwbWji7NbN0z8Q',
            'Content-Type': 'application/json'
        },
        method: 'GET',
        success: function (data) {
            $("#text").html('succes: ' + data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            var output = "ERROR:"+ xhr.responseText;
            output += "\n"+xhr.status;
            output += "\n"+thrownError;
            $("#text").html(output);
            console.log(xhr);
            console.log(ajaxOptions);
            console.log(thrownError)



        }
    });
    alert("Hello");
}