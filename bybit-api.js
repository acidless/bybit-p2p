export async function getP2PData(payment) {
    const response = await fetch("https://api2.bybit.com/fiat/otc/item/online", {
        method: "POST", body: JSON.stringify({
            "userId": process.env.BYBIT_ID,
            "tokenId": "USDT",
            "currencyId": "RUB",
            "payment": payment ? [payment] : [],
            "side": "1",
            "size": "100",
            "page": "1",
            "amount": "",
            "authMaker": false,
            "canTrade": false
        })
    });

    const data = await response.json();
    const items = data.result.items;
    if(!items.length){
        return;
    }

    let minPrice = +items[0].price, maxPrice = +items[0].price, avgPrice = 0;

    for(let item of items){
        const itemPrice = +item.price;
        if(itemPrice < minPrice){
            minPrice = itemPrice;
        }else if(itemPrice > maxPrice){
            maxPrice = itemPrice;
        }

        avgPrice += itemPrice;
    }

    avgPrice = Math.round(avgPrice / items.length * 100) / 100;
    return {minPrice, maxPrice, avgPrice};
}