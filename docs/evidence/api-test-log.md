
### 1 Register
`POST /auth/register`
```
{"token":"<REDACTED>","userId":"4abdd159-4221-46e7-84f0-cc10a6bea4f7","email":"cap19391@example.com","name":"Capstone User"}
[HTTP 201]
```

### 2 Login
`POST /auth/login`
```
{"token":"<REDACTED>","userId":"cmwao3kzh002d6wjgo3f5yviw","email":"demo@chapterandco.com","name":"Demo User"}
[HTTP 200]
```

### 3 Categories
`GET /categories`
```
{"categories":[{"id":"cmwao3kf900006wjgiy6niw8j","name":"Fiction","slug":"fiction","description":"Literary fiction, contemporary and classic novels.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.845Z"},{"id":"cmwao3kg000026wjgp9310tys","name":"Mystery & Thriller","slug":"mystery-thriller","description":"Crime, suspense and psychological thrillers.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.845Z"},{"id":"cmwao3kfz00016wjg5pqfndem","name":"Poetry","slug":"poetry","description":"Classic and modern poetry collections.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.845Z"},{"id":"cmwao3kg100036wjg7x6jiaau","name":"History","slug":"history","description":"World history, social history
```

### 4 Books page
`GET /books?size=3`
```
{"books":[{"id":"cmwao3kpx002c6wjg4e7muakb","title":"We Should All Be Feminists","slug":"we-should-all-be-feminists","authorId":"cmwao3kgj000d6wjgizzwx6zm","author":{"id":"cmwao3kgj000d6wjgizzwx6zm","name":"Chimamanda Ngozi Adichie","bio":"Nigerian author and feminist, known for Americanah and Half of a Yellow Sun.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.891Z"},"description":"Adapted from Adichie's famous TEDx talk, this essay defines feminism for the twenty-first century and argues why every individual benefits from gender equality.","coverUrl":null,"price":9.99,"compareAtPrice":null,"isbn":null,"publisher":"Anchor Books","publishedAt":"2014-07-29T00:00:00Z","pages":64,"language":
```

### 5 Featured
`GET /books/featured`
```
{"books":[{"id":"cmwao3kkc001g6wjgbp8wr1n2","title":"Becoming","slug":"becoming","authorId":"cmwao3khi000m6wjgpi695ud7","author":{"id":"cmwao3khi000m6wjgpi695ud7","name":"Michelle Obama","bio":"Former US First Lady and bestselling memoirist.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.891Z"},"description":"An intimate, powerful memoir by the former First Lady of the United States, chronicling her journey from Chicago's South Side to the White House.","coverUrl":null,"price":19.99,"compareAtPrice":24.99,"isbn":null,"publisher":"Crown","publishedAt":"2018-11-13T00:00:00Z","pages":426,"language":"English","stock":80,"featured":true,"bestseller":true,"createdAt":"2026-11-10T12:29:44.028Z",
```

### 6 Bestsellers
`GET /books/bestsellers`
```
{"books":[{"id":"cmwao3kpx002c6wjg4e7muakb","title":"We Should All Be Feminists","slug":"we-should-all-be-feminists","authorId":"cmwao3kgj000d6wjgizzwx6zm","author":{"id":"cmwao3kgj000d6wjgizzwx6zm","name":"Chimamanda Ngozi Adichie","bio":"Nigerian author and feminist, known for Americanah and Half of a Yellow Sun.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.891Z"},"description":"Adapted from Adichie's famous TEDx talk, this essay defines feminism for the twenty-first century and argues why every individual benefits from gender equality.","coverUrl":null,"price":9.99,"compareAtPrice":null,"isbn":null,"publisher":"Anchor Books","publishedAt":"2014-07-29T00:00:00Z","pages":64,"language":
```

### 7 Book detail
`GET /books/we-should-all-be-feminists`
```
{"book":{"id":"cmwao3kpx002c6wjg4e7muakb","title":"We Should All Be Feminists","slug":"we-should-all-be-feminists","authorId":"cmwao3kgj000d6wjgizzwx6zm","author":{"id":"cmwao3kgj000d6wjgizzwx6zm","name":"Chimamanda Ngozi Adichie","bio":"Nigerian author and feminist, known for Americanah and Half of a Yellow Sun.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.891Z"},"description":"Adapted from Adichie's famous TEDx talk, this essay defines feminism for the twenty-first century and argues why every individual benefits from gender equality.","coverUrl":null,"price":9.99,"compareAtPrice":null,"isbn":null,"publisher":"Anchor Books","publishedAt":"2014-07-29T00:00:00Z","pages":64,"language":"E
```

### 8 Related
`GET /books/we-should-all-be-feminists/related`
```
{"books":[{"id":"cmwao3kk4001e6wjgfv5ob0tz","title":"Sapiens: A Brief History of Humankind","slug":"sapiens","authorId":"cmwao3kgj000i6wjgnei5j6zu","author":{"id":"cmwao3kgj000i6wjgnei5j6zu","name":"Yuval Noah Harari","bio":"Israeli historian and author of Sapiens, Homo Deus and 21 Lessons.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.891Z"},"description":"A sweeping survey of human history from the Stone Age to the present, exploring how Homo sapiens came to dominate the Earth.","coverUrl":null,"price":18.99,"compareAtPrice":22.99,"isbn":null,"publisher":"Harper","publishedAt":"2011-01-01T00:00:00Z","pages":443,"language":"English","stock":75,"featured":true,"bestseller":true,"createdA
```

### 9 Create address
`POST /addresses`
```
{"address":{"id":"c4678474-df68-49ac-bc94-e9743aac6d34","userId":"cmwao3kzh002d6wjgo3f5yviw","fullName":"Demo User","line1":"1 Main St","line2":null,"city":"Bucharest","state":null,"postalCode":"010101","country":"RO","isDefault":true,"createdAt":"2026-11-10T12:30:19.238504391Z"}}
[HTTP 201]
```

### 10 Gift points
`GET /gift-points`
```
{"balance":500}
[HTTP 200]
```

### 11 Checkout (card)
`POST /checkout`
```
{"error":"Invalid payment method: CREDIT_CARD"}
[HTTP 400]
```

### 11 Checkout (DEMO_CARD)
`POST /checkout`
```
{"orderId":"fcd183ef-9786-4c15-bb44-e018a6f03575","reference":"06C70F36E635"}
[HTTP 201]
```

### 12 Gift points after
`GET /gift-points`
```
{"balance":513}
[HTTP 200]
```

### 13 Orders list
`GET /orders`
```
{"orders":[{"id":"fcd183ef-9786-4c15-bb44-e018a6f03575","reference":"06C70F36E635","userId":"cmwao3kzh002d6wjgo3f5yviw","addressId":"cmwao3kzp002f6wjgfbek3dux","address":{"id":"cmwao3kzp002f6wjgfbek3dux","userId":"cmwao3kzh002d6wjgo3f5yviw","fullName":"Demo User","line1":"123 Bookshelf Lane","line2":null,"city":"Reading","state":"Berkshire","postalCode":"RG1 1AA","country":"GB","isDefault":true,"createdAt":"2026-11-10T12:29:44.582Z"},"status":"CONFIRMED","subtotal":9.99,"shippingCost":3.99,"giftPointsUsed":0,"giftPointsDiscount":0.00,"total":13.98,"notes":null,"createdAt":"2026-11-10T12:30:45.586Z","updatedAt":"2026-11-10T12:30:45.592Z","orderItems":[{"id":"182e148b-fc99-4f23-aace-bb7462468fc3","orderId":"fcd183ef-9786-4c15-bb44-e018a6f03575","bookId":"cmwao3kpx002c6wjg4e7muakb","book":{"id":"cmwao3kpx002c6wjg4e7muakb","title":"We Should All Be Feminists","slug":"we-should-all-be-feminists","authorId":"cmwao3kgj000d6wjgizzwx6zm","author":{"id":"cmwao3kgj000d6wjgizzwx6zm","name":"Chimamanda Ngozi Adichie","bio":"Nigerian author and feminist, known for Americanah and Half of a Yellow S
```

### 14 Order detail
`GET /orders/KeyError: 'id'`
```

[HTTP 000]
```

### 15 Buy again
`GET /orders/buy-again`
```
{"books":[{"id":"cmwao3kpx002c6wjg4e7muakb","title":"We Should All Be Feminists","slug":"we-should-all-be-feminists","authorId":"cmwao3kgj000d6wjgizzwx6zm","author":{"id":"cmwao3kgj000d6wjgizzwx6zm","name":"Chimamanda Ngozi Adichie","bio":"Nigerian author and feminist, known for Americanah and Half of a Yellow Sun.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.891Z"},"description":"Adapted from Adichie's famous TEDx talk, this essay defines feminism for the twenty-first century and argues why every individual benefits from gender equality.","coverUrl":null,"price":9.99,"compareAtPrice":null,"isbn":null,"publisher":"Anchor Books","publishedAt":"2014-07-29T00:00:00Z","pages":64,"language":"English","stock":69,"featured":false,"bestseller":true,"createdAt":"2026-11-10T12:29:44.230Z","updatedAt":"2026-11-10T12:30:45.590Z","categories":[{"id":"cmwao3kg800046wjglznphke4","name":"Non-Fiction","slug":"non-fiction","description":"Biographies, memoirs, essays and reportage.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.845Z"},{"id":"cmwao3kgb00076wjg8hqs6bje","name":"Philosophy","slug"
```

### 16 Recommendations
`GET /recommendations`
```
{"books":[{"id":"cmwao3kk4001e6wjgfv5ob0tz","title":"Sapiens: A Brief History of Humankind","slug":"sapiens","authorId":"cmwao3kgj000i6wjgnei5j6zu","author":{"id":"cmwao3kgj000i6wjgnei5j6zu","name":"Yuval Noah Harari","bio":"Israeli historian and author of Sapiens, Homo Deus and 21 Lessons.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.891Z"},"description":"A sweeping survey of human history from the Stone Age to the present, exploring how Homo sapiens came to dominate the Earth.","coverUrl":null,"price":18.99,"compareAtPrice":22.99,"isbn":null,"publisher":"Harper","publishedAt":"2011-01-01T00:00:00Z","pages":443,"language":"English","stock":75,"featured":true,"bestseller":true,"createdAt":"2026-11-10T12:29:44.020Z","updatedAt":"2026-11-10T12:29:44.020Z","categories":[{"id":"cmwao3kg100036wjg7x6jiaau","name":"History","slug":"history","description":"World history, social history and political history.","imageUrl":null,"createdAt":"2026-11-10T12:29:43.845Z"},{"id":"cmwao3kg800046wjglznphke4","name":"Non-Fiction","slug":"non-fiction","description":"Biographies, memoirs, essays and 
```

### 14 Order detail
`GET /orders/fcd183ef-9786-4c15-bb44-e018a6f03575`
```
{"order":{"id":"fcd183ef-9786-4c15-bb44-e018a6f03575","reference":"06C70F36E635","userId":"cmwao3kzh002d6wjgo3f5yviw","addressId":"cmwao3kzp002f6wjgfbek3dux","address":{"id":"cmwao3kzp002f6wjgfbek3dux","userId":"cmwao3kzh002d6wjgo3f5yviw","fullName":"Demo User","line1":"123 Bookshelf Lane","line2":null,"city":"Reading","state":"Berkshire","postalCode":"RG1 1AA","country":"GB","isDefault":true,"createdAt":"2026-11-10T12:29:44.582Z"},"status":"CONFIRMED","subtotal":9.99,"shippingCost":3.99,"giftPointsUsed":0,"giftPointsDiscount":0.00,"total":13.98,"notes":null,"createdAt":"2026-11-10T12:30:45.586Z","updatedAt":"2026-11-10T12:30:45.592Z","orderItems":[{"id":"182e148b-fc99-4f23-aace-bb7462468fc3","orderId":"fcd183ef-9786-4c15-bb44-e018a6f03575","bookId":"cmwao3kpx002c6wjg4e7muakb","book":{"id":"cmwao3kpx002c6wjg4e7muakb","title":"We Should All Be Feminists","slug":"we-should-all-be-feminists","authorId":"cmwao3kgj000d6wjgizzwx6zm","author":{"id":"cmwao3kgj000d6wjgizzwx6zm","name":"Chimamanda Ngozi Adichie","bio":"Nigerian author and feminist, known for Americanah and Half of a Yellow Sun
```

### 17 Checkout (GIFT_POINTS)
`POST /checkout`
```
{"orderId":"c991c9dc-0575-4637-b235-9ce4a449a1cc","reference":"8A0ACB329DE5"}
[HTTP 201]
```

### 18 Cancel order
`POST /orders/fcd183ef-9786-4c15-bb44-e018a6f03575/cancel`
```
{"error":"An unexpected error occurred"}
[HTTP 500]
```

### 19 Cancel again
`POST /orders/fcd183ef-9786-4c15-bb44-e018a6f03575/cancel`
```
{"error":"An unexpected error occurred"}
[HTTP 500]
```

### 20 Gift points final
`GET /gift-points`
```
{"balance":425}
[HTTP 200]
```

### 18 Cancel (PATCH, within 48h)
`PATCH /orders/c991c9dc-0575-4637-b235-9ce4a449a1cc`
```
{"order":{"id":"c991c9dc-0575-4637-b235-9ce4a449a1cc","reference":"8A0ACB329DE5","userId":"cmwao3kzh002d6wjgo3f5yviw","addressId":"cmwao3kzp002f6wjgfbek3dux","address":{"id":"cmwao3kzp002f6wjgfbek3dux","userId":"cmwao3kzh002d6wjgo3f5yviw","fullName":"Demo User","line1":"123 Bookshelf Lane","line2":null,"city":"Reading","state":"Berkshire","postalCode":"RG1 1AA","country":"GB","isDefault":true,"createdAt":"2026-11-10T12:29:44.582Z"},"status":"CANCELLED","subtotal":9.99,"shippingCost":3.99,"giftPointsUsed":100,"giftPointsDiscount":1.00,"total":12.98,"notes":null,"createdAt":"2026-11-10T12:31:06.034Z","updatedAt":"2026-11-10T12:31:33.873334827Z","orderItems":[{"id":"775b22fc-3922-4b42-8def-7c82
```

### 19 Cancel again (already cancelled)
`PATCH /orders/c991c9dc-0575-4637-b235-9ce4a449a1cc`
```
{"error":"Order is already cancelled"}
[HTTP 400]
```

### 21 Cancel (older than 48h)
`PATCH /orders/fcd183ef-9786-4c15-bb44-e018a6f03575`
```
{"error":"Orders can only be cancelled within 48 hours of purchase"}
[HTTP 400]
```

### 22 Invalid action
`PATCH /orders/fcd183ef-9786-4c15-bb44-e018a6f03575`
```
{"error":"Invalid action"}
[HTTP 400]
```
