const imagePath = "/images/products/";
var Product = Object.create(null);
var collectionId = document.getElementById("collectionId").value;
var itemId = document.getElementById("itemId").value;

fetchItem = async() => {
    fetch('/item/' + collectionId + '/' + itemId, {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((data) => {
                Product = data;
                console.log(data);
                renderImageArray(data);
                renderProperties(data);
        })
        .catch((error) => {
            console.error('ERROR:', error);
    });
},
updateItem = async() => {
    $.ajax({
        url: '/updateProduct/' + collectionId + '/' + itemId,
        headers: {"Content-Type": "application/json"},
        type: 'PUT',
        dataType: 'json',
        data: JSON.stringify(Product),
        success: function (data, textStatus, xhr) {
            //console.log(collection.products[0].productThumbs);
            location.href = "/item/" + collectionId + "/" + itemId;
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
        const reg = /(?:\(['"]?)(.*?)(?:['"]?\))/;
        const name = reg.exec(this.style.backgroundImage);
        const formattedValue = String(name[1].split(imagePath)).replaceAll(',', '');
        productStringArray.push(formattedValue);
    });
    return productStringArray;
},
renderImageArray = (product) => {
    $("#imageContainer").empty();
    Product.productThumbs.forEach(o => {
        const imageName = o.split("/");
        $("#imageContainer").append(`<span class="draggable-element d-1" style="background-image: url('${imagePath + o}');background-size:contain;background-repeat:no-repeat;background-position: center;"><button name="${imageName[1]}" type="button" class="btn btn-danger btn-sm" style="float:right" onclick="removeImage(this)">x</button></span>`);
    });

    //Enable the drag
    $('.draggable-element').arrangeable();   
},
renderProperties = (product) => {
    $("[name='active']").prop("checked", product.active );
    $("[name='isSold']").prop("checked", product.isSold );          
    $("[name='productName']").val(product.productName);
    $(".ql-editor")[0].innerHTML = product.description;
    $("[name='size']").val(product.size);
    $("[name='price']").val(product.price);
    $("[name='measurements']").val(product.measurements);
    $("[name='parcel']").val(product.ausPostParcel);
},
removeImage = (element) => {
    Product.productThumbs = Product.productThumbs.filter(function(e) { return e !== String(Product.productThumbs.filter(name => name.includes(element.name))) })
    renderImageArray(Product); 
},

$( document ).ready(async function(){ 
    await fetchItem(); 

    $( "#saveItem").click(async function() {

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
    });
});