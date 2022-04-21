window.addEventListener("load", () => {
  const cartSummary = document.getElementById("cart-summary");
  const checkoutButton = document.getElementById("checkout-button");
  const promotionHolder = document.getElementById("promotion-holder");
  const voucherValue = document.getElementById("voucher-code");
  const buttonValidateCode = document.getElementById("check-voucher-code");
  const subtotal = document.getElementById("subtotal");
  const allDiscountsSpan = document.getElementById("all-discounts");
  const grandTotalSpan = document.getElementById("grand-total");

  let items = [
    {
      productName: "Johan & Nystrom Caravan",
      productDescription: "20 oz bag",
      quantity: 1,
      price: "26.99",
      src: "./images/johan2.jpeg",
    },
    {
      productName: "Illy Arabica",
      productDescription: "Bestseller 18 oz bag",
      quantity: 1,
      price: "21.02",
      src: "./images/illy_arabica.jpeg",
    },
    {
      productName: "Hard Beans Etiopia",
      productDescription: "6 oz bag",
      quantity: 1,
      price: "3.88",
      src: "./images/hardbean.jpeg",
    },
    {
      productName: "Johan & Nystrom Bourbon",
      productDescription: "20 oz bag",
      quantity: 2,
      price: "41.98",
      src: "./images/johan2.jpeg",
    },
  ];

  let promotions = 0;
  let grandTotal = 0;

  const summaryInnerText = () => {
    cartSummary.innerHTML = `<h2>Item summary (4)</h2> ${items
      .map(
        (item, index) =>
          `<div class='item' key=${index}>
                      <img src='${item.src}' alt="product ${item.productName}"/>
                      <div class='name-and-description'>
                        <span>${item.productName}</span>
                        <span>${item.productDescription}</span>
                      </div>
                      <div class="form-and-button-holder">
                        <button class='decrement' id="decrementQuantity-${index}">-</button>
                        <form>
                        <input class='increment-input' type="number" value="${item.quantity}"/>
                        </form>
                        <button class='increment' id="incrementQuantity-${index}">+</button>
                      </div>
                      <span class="price">$${item.price}</span>
                      <button class="remove-button">Remove</button>
                     </div>`
      )
      .join("")}`;
  }
  summaryInnerText();

  const incrementQuantity = () => {
    const incrementButtons = document.querySelectorAll('.increment');
    const incrementInput = document.querySelectorAll('.increment-input');
    incrementButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        items[index].quantity = items[index].quantity + 1;
        incrementInput[index].value = items[index].quantity;
        summaryPrices();
      })
    })
  }
  incrementQuantity();

  const decrementQuantity = () => {
    const decrementButtons = document.querySelectorAll('.decrement');
    const incrementInput = document.querySelectorAll('.increment-input');
    decrementButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        if (items[index].quantity < 1) return;
        items[index].quantity = items[index].quantity - 1;
        incrementInput[index].value = items[index].quantity;
        summaryPrices();
      })
    })
  }
  decrementQuantity();

  function addProductPrices(items) {
    return items
      .map((item) => {
        return parseFloat(item.price) * parseInt(item.quantity);
      })
      .reduce((partialSum, a) => partialSum + a, 0)
      .toFixed(2);
  }

  const summaryPrices = () => {
    const summedUpPrices = addProductPrices(items);
    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotal = summedUpPrices - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
  }

  voucherValue.addEventListener("input", () => {
    if (voucherValue.value === "") {
      checkoutButton.innerHTML = "Checkout";
      grandTotalSpan.innerHTML = `$${(grandTotal + promotions).toFixed(2)}`;
      allDiscountsSpan.innerHTML = "n/a";
      promotionHolder.innerHTML = "";
    }
  });

  const validateCode = async (voucherCode) => {
    if (items.reduce((a, b) => a + b.quantity, 0) === 0) {
      promotionHolder.innerHTML = `<h5 id="error-message">No items in basket</h5>`;

      return false;
    }
    if (!voucherCode) {
      promotionHolder.innerHTML = `<h5 id="error-message">Please enter voucher code</h5>`;
      return false;
    }

    const response = await fetch(`/validate-voucher`, {
      method: "POST",
      headers: {
        //prettier-ignore
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voucherCode }),
    });
    const data = await response.json();

    if (response.status === 200) {
      return { amount: data.amount, campaign: data.campaign };
    }
    if (response.status === 404) {
      return Promise.reject(data);
    }
    if (response.status === 400) {
      return Promise.reject(data);
    }
  }

  const redeemCode = async (voucherCode) => {
    if (items.reduce((a, b) => a + b.quantity, 0) === 0) {
      promotionHolder.innerHTML = `<h5 id="error-message">No items in basket</h5>`;
      return false;
    }

    if (!voucherCode) {
      promotionHolder.innerHTML = `<h5 id="error-message">Please enter voucher code</h5>`;
      return false;
    }

    const response = await fetch(`/redeem-voucher`, {
      method: "POST",
      headers: {
        //prettier-ignore
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voucherCode }),
    });

    const data = await response.json();
    if (response.status === 200) {
      return { amount: data.amount, campaign: data.campaign };
    }

    if (response.status === 404) {
      return Promise.reject(data);
    }

    if (response.status === 400) {
      return Promise.reject(data);
    }
  }

  const summedPricesAfterValidate = (result) => {
    promotions = result.amount / 100;
            grandTotal = addProductPrices(items) - promotions;
            grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
            allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
            promotionHolder.innerHTML = `<h5>${result.campaign ? result.campaign : ''
              }<span>-${promotions.toFixed(2)}$ OFF</span></h5>
            <span>-$${promotions.toFixed(2)}</span>`;
  }

  checkoutButton.addEventListener("click", () => {
    redeemCode(voucherValue.value)
      .then(
        (result) => {
          if (result.amount) {
            checkoutButton.innerHTML = `<p>Thank you!</p>`;
            summedPricesAfterValidate(result);
          }
        }
      ).catch(error => {
        promotionHolder.innerHTML = `<h5 id="error-message">${error.message}</h5>`;
      })
  });

  buttonValidateCode.addEventListener("click", () => {
    validateCode(voucherValue.value).then(
      (result) => {
        if (result.amount) {
          summedPricesAfterValidate(result);
        }
      }
    ).catch(error => {
      promotionHolder.innerHTML = `<h5 id=error-message">${error.message}</h5>`;
    })
  });
});
