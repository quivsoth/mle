var Product = Object.create(null);


fetch("/api/allProducts", (data) => { 
    Products = JSON.parse(data) 
});



fetchItem = async() => {
    var url = '/api/product/' + document.getElementById("itemId").value;
    fetch(url, (response) => { 
        Product = JSON.parse(response);
        renderImageArray();
        renderProperties();
    });
            //.then((response) => {response.json())
            //.then((data) => {
            //    console.log(data);
            //    Product = data;
                //renderImageArray(data);
                //renderProperties(data);
        //})
    //     .catch((error) => {
    //         console.error('ERROR:', error);
    // });
},
updateItem = async() => {
    console.log(updateItem);
    $.ajax({
        url: '/updateProduct',
        headers: {"Content-Type": "application/json"},
        type: 'PUT',
        dataType: 'json',
        data: JSON.stringify(Product),
        success: function (data, textStatus, xhr) {
            //console.log(collection.products[0].productThumbs);
            //location.href = "/product/" + itemId;
            sendToastMessage("Changes saved successfully.");
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log('Error in Operation');
            console.log('Error: ' + errorThrown);
        }
    });
},
buildImageArray = (element) => {
    var productStringArray = [];
    $(element).children().each(function () {

        console.log(element);
        const reg = /(?:\(['"]?)(.*?)(?:['"]?\))/;
        const name = reg.exec(this.style.backgroundImage);
        const formattedValue = String(name[1].split(imagePath)).replaceAll(',', '');
        productStringArray.push(formattedValue);
    });
    return productStringArray;
},
renderImageArray = () => {
    $("#imageContainer").empty();
    Product.productThumbs.forEach(o => {
        const imageName = o.split("/");
        $("#imageContainer").append(`<span class="draggable-element d-1" style="background-image: url('${imagePath + o}');background-size:contain;background-repeat:no-repeat;background-position: center;"><button name="${imageName[1]}" type="button" class="btn btn-danger btn-sm" style="float:right" onclick="removeImage(this)">x</button></span>`);
    });

    //Enable the drag
    $('.draggable-element').arrangeable();   
},
renderProperties = () => {
    $("[name='active']").prop("checked", Product.active );
    $("[name='isSold']").prop("checked", Product.isSold );          
    $("[name='productName']").val(Product.productName);
    $(".ql-editor")[0].innerHTML = Product.description;
    $("[name='size']").val(Product.size);
    $("[name='price']").val(Product.price);
    $("[name='measurements']").val(Product.measurements);
    $("[name='parcel']").val(Product.ausPostParcel);
},
removeImage = (element) => {
    Product.productThumbs = Product.productThumbs.filter(function(e) { return e !== String(Product.productThumbs.filter(name => name.includes(element.name))) })
    renderImageArray(Product); 
},
saveProduct = async() => {
    Product.active = $("[name='active']")[0].checked;
    Product.isSold = $("[name='isSold']")[0].checked;
    Product.productName = $("[name='productName']").val();
    Product.size = $("[name='size']").val();
    Product.price = $("[name='price']").val();
    Product.description =  $(".ql-editor")[0].innerHTML;
    Product.measurements = $("[name='measurements']").val();
    Product.ausPostParcel = $("[name='parcel']").val();
    Product.productThumbs = buildImageArray('#imageContainer');
    await updateItem();
}

$( document ).ready(async function(){ 
    await fetchItem();

    $( "#saveItem").click(async function() {
       saveProduct();
    });
});