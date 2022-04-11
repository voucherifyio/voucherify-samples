window.addEventListener("load", () => {
  const cartSummary = document.getElementById("cartSummary");
  const checkoutButton = document.getElementById("checkout-button");
  const promotionHolder = document.getElementById("promotion-holder");
  let items = [
    {
      productName: "Johan & Nystrom Caravan",
      productDescription: "20 oz bag",
      quantity: 1,
      price: "26.99",
      src: "./../../images/johan.jpeg",
    },
    {
      productName: "Illy Arabica",
      productDescription: "Bestseller 18 oz bag",
      quantity: 1,
      price: "21.02",
      src: "./../../images/illy_arabica.jpeg",
    },
    {
      productName: "Hard Beans Etiopia",
      productDescription: "6 oz bag",
      quantity: 1,
      price: "3.88",
      src: "./../../images/hardbean.jpeg",
    },
    {
      productName: "Johan & Nystrom Bourbon",
      productDescription: "20 oz bag",
      quantity: 2,
      price: "41.98",
      src: "./../../images/johan2.jpeg",
    },
  ];

  let promotions = 0;
  let grandTotal = 0;
  let isError = false;

  const buttonToCheckVoucherCode =
    document.getElementsByClassName("checkVoucherCode");

  async function checkVoucherCode(voucherCode) {
    if (items.reduce((a, b) => a + b.quantity, 0) === 0) {
      promotionHolder.innerHTML = `<h5 id="error-message">No items in basket!</h5>`;

      return false;
    }
    if (!voucherCode) {
      promotionHolder.innerHTML = `<h5 id="error-message">Please enter voucher code!</h5>`;
      return false;
    }
    const response = await fetch(`/check-voucher`, {
      method: "POST",
      headers: {
        //prettier-ignore
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voucherCode }),
    });
    const data = await response.json();
    if (data.message === "Voucher granted" && data.status === "success") {
      console.log(data)
      promotionHolder.innerHTML = null;
      return { amount: data.amount, campaign: data.campaign };
    }
    if (data.status === "error") {
      console.log(data.message)
      promotionHolder.innerHTML = `<h5 id="error-message">Voucher code incorrect</h5>`;
      return false;
    }
  }
  async function redeemVoucherCode(voucherCode) {
    if (items.reduce((a, b) => a + b.quantity, 0) === 0) {
      promotionHolder.innerHTML = `<h5 id="error-message">No items in basket!</h5>`;

      return false;
    }
    if (!voucherCode) {
      promotionHolder.innerHTML = `<h5 id="error-message">Please enter voucher code!</h5>`;
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
    if (data.message === "Voucher granted" && data.status === "success") {
      console.log(data)
      promotionHolder.innerHTML = null;
      return { amount: data.amount, campaign: data.campaign };
    }
    if (data.status === "error") {
      promotionHolder.innerHTML = `<h5 id="error-message">Voucher code incorrect</h5>`;
      return false;
    }
  }

  checkoutButton.addEventListener("click", () => {
    redeemVoucherCode(document.getElementById("voucherCode").value).then(
      (result) => {
        if (result.amount) {
          promotions = result.amount / 100;
          grandTotal = addProductPrices(items) - promotions;
          grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
          allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
          promotionHolder.innerHTML = `<h5>${
            result.campaign || ''
          }<span>(-${promotions.toFixed(2)})</span></h5>
            <span>-$${promotions.toFixed(2)}</span>`;
        }
      }
    );
  });

  buttonToCheckVoucherCode[0].addEventListener("click", () => {
    checkVoucherCode(document.getElementById("voucherCode").value).then(
      (result) => {
        if (result.amount) {
          promotions = result.amount / 100;
          grandTotal = addProductPrices(items) - promotions;
          grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
          allDiscountsSpan.innerHTML = `-$${promotions.toFixed(2)}`;
          promotionHolder.innerHTML = `<h5>${
            result.campaign || ''
          }<span>(-${promotions.toFixed(2)})</span></h5>
          <span>-$${promotions.toFixed(2)}</span>`;
        }
      }
    );
  });

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
                      <input type="number" value="${item.quantity}"/>
                      </form>
                      <button class='increment' id="incrementQuantity-${index}">+</button>
                    </div>
                    <span class="price">$${item.price}</span>
                    <button class="remove-button">Remove</button>
                   </div>`
    )
    .join("")}`;

  const buttonsToAddIncrement = document.getElementsByClassName("increment");
  const buttonsToAddDecrement = document.getElementsByClassName("decrement");
  const subtotal = document.querySelector("#subtotal-value");

  const allDiscountsSpan = document.querySelector("#all-discounts-value");
  const grandTotalSpan = document.querySelector("#grand-total-value");

  for (let i = 0; i < buttonsToAddIncrement.length; i++) {
    buttonsToAddIncrement[i].addEventListener("click", () =>
      incrementQuantity(i)
    );
  }
  for (let i = 0; i < buttonsToAddDecrement.length; i++) {
    buttonsToAddDecrement[i].addEventListener("click", () =>
      decrementQuantity(i)
    );
  }

  function addProductPrices(items) {
    return items
      .map((item) => {
        return parseFloat(item.price) * parseInt(item.quantity);
      })
      .reduce((partialSum, a) => partialSum + a, 0)
      .toFixed(2);
  }

  function incrementQuantity(inde2) {
    items[inde2].quantity = items[inde2].quantity + 1;
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
                        <input type="number" value="${item.quantity}"/>
                        </form>
                        <button class='increment' id="incrementQuantity-${index}">+</button>
                      </div>
                      <span class="price">$${item.price}</span>
                      <button class="remove-button">Remove</button>
                     </div>`
      )
      .join("")}`;
    const summedUpPrices = addProductPrices(items);

    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotal = summedUpPrices - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
    const buttonsToAddIncrement = document.getElementsByClassName("increment");
    const buttonsToAddDecrement = document.getElementsByClassName("decrement");

    for (let i = 0; i < buttonsToAddIncrement.length; i++) {
      buttonsToAddIncrement[i].addEventListener("click", () =>
        incrementQuantity(i)
      );
    }
    for (let i = 0; i < buttonsToAddDecrement.length; i++) {
      buttonsToAddDecrement[i].addEventListener("click", () =>
        decrementQuantity(i)
      );
    }
  }

  function decrementQuantity(inde2) {
    if (items[inde2].quantity < 1) return;

    items[inde2].quantity = items[inde2].quantity - 1;
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
                        <input type="number" value="${item.quantity}"/>
                        </form>
                        <button class='increment' id="incrementQuantity-${index}">+</button>
                      </div>
                      <span class="price">$${item.price}</span>
                      <button class="remove-button">Remove</button>
                     </div>`
      )
      .join("")}`;
    const summedUpPrices = addProductPrices(items);
    subtotal.innerHTML = `$${summedUpPrices}`;
    grandTotal = summedUpPrices - promotions;
    grandTotalSpan.innerHTML = `$${grandTotal.toFixed(2)}`;
    const buttonsToAddIncrement = document.getElementsByClassName("increment");
    const buttonsToAddDecrement = document.getElementsByClassName("decrement");

    for (let i = 0; i < buttonsToAddIncrement.length; i++) {
      buttonsToAddIncrement[i].addEventListener("click", () =>
        incrementQuantity(i)
      );
    }
    for (let i = 0; i < buttonsToAddDecrement.length; i++) {
      buttonsToAddDecrement[i].addEventListener("click", () =>
        decrementQuantity(i)
      );
    }
  }
});
