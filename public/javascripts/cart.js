let buildCart = (result) => {
    $("#cartList").empty();
    if (result.length > 0) {
        document.getElementById("btnCheckout").style.visibility = 'visible';
        var subtotal = 0;
        var qty = 0;

        $("#cartList").append(`<div class="row" style="border-bottom: 0.5px dashed black"><div class="col-3">Image</div><div class="col-7">Name</div><div class="col-2">Price</div></div>`);
        result.forEach((p) => {
            subtotal += p.item.price;
            qty += 1;
            $("#cartList").append(`<div class="row mt-4"><div class="col-3" style="position:relative;display:inline"><img src="${imagePath}${
                p.item.productThumbs[0]
            }" style="max-height:130px;"><img src="/images/remove.png" onclick="DeleteItem(this)"  data-productId=${
                p.item.productId
            } style="max-height:15px;position:absolute;top:0;left:0; margin-left:7px; margin-top:-5px;" /></div><div class="col-7">${
                p.item.productName
            }</div><div class="col-2">$${
                p.item.price
            }</div></div>`);
        });
        $("#cartList").append(`<div class="row mt-4 mb-4"><div class="col-6">Qty: ${qty}</div><div class="col-6">Subtotal: <span class="baja-font-135">$${subtotal}</span></div></div>`);
        document.getElementById("cartTotal").textContent = qty;
    } else {
        $("#cartList").append(`<div class="row mt-4 mb-4">There are no items in your cart.</div>`);
        document.getElementById("btnCheckout").style.visibility = 'hidden';
    }
}

let DeleteItem = (e) => {
    var data = { productId: parseInt(e.getAttribute('data-productId')) };
    cartDelete("/deleteCart", data, (result) => {
        var data = JSON.parse(result);
        buildCart(data);
    });
    RevertCart(data.productId);
}