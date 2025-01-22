# doc/tree.md
┣ 📂config
┃ ┣ 📜default.ts
┃ ┣ 📜index.ts
┃ ┗ 📜types.ts
┣ 📂mockData 
┃ ┗ 📂json
┃   ┗ 📂mongodb
┃     ┣ 📜db_machi_shad.collection_balance.json
┃     ┣ 📜db_machi_shad.collection_cmc.json
┃     ┣ 📜db_machi_shad.collection_highest_price.json
┃     ┣ 📜db_machi_shad.collection_machi.json
┃     ┣ 📜db_machi_shad.collection_market.json
┃     ┣ 📜db_machi_shad.collection_order.json
┃     ┣ 📜db_machi_shad.collection_price_btc.json
┃     ┣ 📜db_machi_shad.collection_price_eth.json
┃     ┣ 📜db_machi_shad.collection_serverconfig.json
┃     ┣ 📜db_machi_shad.collection_shad.json
┃     ┣ 📜db_machi_shad.collection_strategy.json
┃     ┣ 📜db_machi_shad.collection_swap.json
┃     ┣ 📜db_machi_shad.collection_ticker.json
┃     ┣ 📜db_machi_shad.collection_timestamp.json
┃     ┣ 📜db_machi_shad.collection_trade.json
┃     ┗ 📜db_machi_shad.collection_user.json
┣ 📂src
┃ ┣ 📂constants
┃ ┃ ┣ 📜coins.ts
┃ ┃ ┣ 📜collection.ts
┃ ┃ ┣ 📜metrics.ts
┃ ┃ ┗ 📜platform.ts
┃ ┣ 📂ctrl
┃ ┃ ┣ 📂config
┃ ┃ ┃ ┗ 📜ctrlConfigApi.ts
┃ ┃ ┣ 📜ctrlAuth.ts
┃ ┃ ┣ 📜ctrlBalance.ts
┃ ┃ ┣ 📜ctrlCmc.ts
┃ ┃ ┣ 📜ctrlConverter.ts
┃ ┃ ┣ 📜ctrlMachi.ts
┃ ┃ ┣ 📜ctrlMarket.ts
┃ ┃ ┣ 📜ctrlOrderBalance.ts
┃ ┃ ┣ 📜ctrlOrderMarket.ts
┃ ┃ ┣ 📜ctrlStrategy.ts
┃ ┃ ┣ 📜ctrlTicker.ts
┃ ┃ ┣ 📜ctrlTimestamp.ts
┃ ┃ ┗ 📜ctrlTrade.ts
┃ ┣ 📂middlewares
┃ ┃ ┗ 📜fileUploadMiddleware.ts
┃ ┣ 📂repo
┃ ┃ ┣ 📂config
┃ ┃ ┃ ┣ 📜repoConfigApi.ts
┃ ┃ ┃ ┗ 📜repoConfigServer.ts
┃ ┃ ┣ 📜repoAuth.ts
┃ ┃ ┣ 📜repoBalance.ts
┃ ┃ ┣ 📜repoCmc.ts
┃ ┃ ┣ 📜repoHighPrice.ts
┃ ┃ ┣ 📜repoMachi.ts
┃ ┃ ┣ 📜repoMarket.ts
┃ ┃ ┣ 📜repoOrderBalance.ts
┃ ┃ ┣ 📜repoStrategy.ts
┃ ┃ ┣ 📜repoTicker.ts
┃ ┃ ┣ 📜repoTimestamp.ts
┃ ┃ ┣ 📜repoTrade.ts
┃ ┃ ┗ 📜repoTrailingStop.ts
┃ ┣ 📂routes
┃ ┃ ┣ 📂config
┃ ┃ ┃ ┗ 📜routeApi.ts
┃ ┃ ┣ 📜index.ts
┃ ┃ ┣ 📜routeAuth.ts
┃ ┃ ┣ 📜routeBalance.ts
┃ ┃ ┣ 📜routeCmc.ts
┃ ┃ ┣ 📜routeConverter.ts
┃ ┃ ┣ 📜routeMachi.ts
┃ ┃ ┣ 📜routeMarket.ts
┃ ┃ ┣ 📜routeOrder.ts
┃ ┃ ┣ 📜routeStrategy.ts
┃ ┃ ┣ 📜routeTicker.ts
┃ ┃ ┣ 📜routeTimestamp.ts
┃ ┃ ┗ 📜routeTrade.ts
┃ ┣ 📂services
┃ ┃ ┣ 📂api
┃ ┃ ┃ ┣ 📂database
┃ ┃ ┃ ┃ ┣ 📜serviceDatabase.ts
┃ ┃ ┃ ┃ ┣ 📜serviceMongodb.ts
┃ ┃ ┃ ┃ ┣ 📜serviceMongodbOperations.ts
┃ ┃ ┃ ┃ ┣ 📜serviceStrategy.ts
┃ ┃ ┃ ┃ ┗ 📜serviceTimestamp.ts
┃ ┃ ┃ ┣ 📂platform
┃ ┃ ┃ ┃ ┣ 📜mappingPlatform.ts
┃ ┃ ┃ ┃ ┣ 📜serviceBalance.ts
┃ ┃ ┃ ┃ ┣ 📜serviceCcxt.ts
┃ ┃ ┃ ┃ ┣ 📜serviceMachi.ts
┃ ┃ ┃ ┃ ┣ 📜serviceMarket.ts
┃ ┃ ┃ ┃ ┣ 📜serviceOrderBalance.ts
┃ ┃ ┃ ┃ ┣ 📜serviceOrderMarket.ts
┃ ┃ ┃ ┃ ┣ 📜serviceSwap.ts
┃ ┃ ┃ ┃ ┣ 📜serviceTicker.ts
┃ ┃ ┃ ┃ ┗ 📜serviceTrade.ts
┃ ┃ ┃ ┗ 📜serviceCmc.ts
┃ ┃ ┣ 📂config
┃ ┃ ┃ ┣ 📜serviceConfigApi.ts
┃ ┃ ┃ ┗ 📜serviceConfigServer.ts
┃ ┃ ┣ 📂cryptoAnalytics
┃ ┃ ┃ ┣ 📂indicator
┃ ┃ ┃ ┃ ┣ 📜bollingerBands.ts
┃ ┃ ┃ ┃ ┣ 📜indicator.md
┃ ┃ ┃ ┃ ┣ 📜movingAverageCross.ts
┃ ┃ ┃ ┃ ┗ 📜rsi.ts
┃ ┃ ┃ ┣ 📂invest
┃ ┃ ┃ ┃ ┣ 📜index.ts
┃ ┃ ┃ ┃ ┣ 📜invest.md
┃ ┃ ┃ ┃ ┣ 📜progressiveSell.ts
┃ ┃ ┃ ┃ ┣ 📜shad.ts
┃ ┃ ┃ ┃ ┣ 📜thresholdSell.ts
┃ ┃ ┃ ┃ ┗ 📜tieredSell.ts
┃ ┃ ┃ ┣ 📜cmc.ts
┃ ┃ ┃ ┣ 📜defaultAssets.ts
┃ ┃ ┃ ┣ 📜tradeCalculations.ts
┃ ┃ ┃ ┗ 📜tradingUtils.ts
┃ ┃ ┣ 📂update
┃ ┃ ┃ ┣ 📜updateManager.ts
┃ ┃ ┃ ┣ 📜updateManagerGeneral.ts
┃ ┃ ┃ ┗ 📜updateManagerPlatform.ts
┃ ┃ ┣ 📜serviceAuth.ts
┃ ┃ ┣ 📜serviceCache.ts
┃ ┃ ┣ 📜serviceConverter.ts
┃ ┃ ┣ 📜serviceCron.ts
┃ ┃ ┣ 📜serviceEmail.ts
┃ ┃ ┣ 📜serviceProcessor.ts
┃ ┃ ┗ 📜serviceTrailingStop.ts
┃ ┣ 📂types
┃ ┃ ┣ 📜auth.ts
┃ ┃ ┣ 📜balance.ts
┃ ┃ ┣ 📜cache.ts
┃ ┃ ┣ 📜cmc.ts
┃ ┃ ┣ 📜cron.ts
┃ ┃ ┣ 📜cryptoAnalytics.ts
┃ ┃ ┣ 📜database.ts
┃ ┃ ┣ 📜email.ts
┃ ┃ ┣ 📜express.d.ts
┃ ┃ ┣ 📜market.ts
┃ ┃ ┣ 📜mongodb.ts
┃ ┃ ┣ 📜order.ts
┃ ┃ ┣ 📜platform.ts
┃ ┃ ┣ 📜routes.ts
┃ ┃ ┣ 📜strat.ts
┃ ┃ ┣ 📜ticker.ts
┃ ┃ ┣ 📜timestamp.ts
┃ ┃ ┣ 📜trade.ts
┃ ┃ ┗ 📜trailingStop.ts
┃ ┣ 📂utils
┃ ┃ ┣ 📜cronUtil.ts
┃ ┃ ┣ 📜encryption.ts
┃ ┃ ┣ 📜errorUtil.ts
┃ ┃ ┣ 📜loggerUtil.ts
┃ ┃ ┣ 📜mappingUtil.ts
┃ ┃ ┣ 📜metricsUtil.ts
┃ ┃ ┣ 📜mockUtil.ts
┃ ┃ ┣ 📜platformUtil.ts
┃ ┃ ┣ 📜processorUtil.ts
┃ ┃ ┣ 📜retryUtil.ts
┃ ┃ ┗ 📜timeUtil.ts
┃ ┣ 📜index.ts
┃ ┗ 📜server.ts
┣ 📂tests
┃ ┗ 📂unit
┃   ┣ 📂ctrl
┃   ┃ ┣ 📜ctrl-tests.md
┃   ┃ ┣ 📜ctrlAuth.test.ts
┃   ┃ ┣ 📜ctrlBalance.test.ts
┃   ┃ ┣ 📜ctrlCmc.test.ts
┃   ┃ ┣ 📜ctrlConverter.test.ts
┃   ┃ ┣ 📜ctrlMachi.test.ts
┃   ┃ ┣ 📜ctrlMarket.test.ts
┃   ┃ ┣ 📜ctrlOrderBalance.test.ts
┃   ┃ ┣ 📜ctrlOrderMarket.test.ts
┃   ┃ ┣ 📜ctrlStrategy.test.ts
┃   ┃ ┣ 📜ctrlTicker.test.ts
┃   ┃ ┣ 📜ctrlTimestamp.test.ts
┃   ┃ ┗ 📜ctrlTrade.test.ts
┃   ┣ 📂routes
┃   ┃ ┣ 📜machiRoutes.test.ts
┃   ┃ ┣ 📜marketRoutes.test.ts
┃   ┃ ┣ 📜orderRoutes.test.ts
┃   ┃ ┣ 📜routeAuth.test.ts
┃   ┃ ┣ 📜routeBalance.test.ts
┃   ┃ ┣ 📜routeCmc.test.ts
┃   ┃ ┣ 📜routeStrategy.test.ts
┃   ┃ ┣ 📜routeTicker.test.ts
┃   ┃ ┣ 📜routeTimestamp.test.ts
┃   ┃ ┗ 📜routeTrade.test.ts
┃   ┣ 📜bollingerBands.test.ts
┃   ┣ 📜movingAverageCross.test.ts
┃   ┣ 📜progressiveSell.test.ts
┃   ┣ 📜rsi.test.ts
┃   ┣ 📜thresholdSell.test.ts
┃   ┗ 📜tieredSell.test.ts
┣ 📜.env.dev
┣ 📜.gitignore
┣ 📜.gitmodules
┣ 📜.prettierignore
┣ 📜.prettierrc
┣ 📜devBook.md
┣ 📜eslint.config.mjs
┣ 📜jest.config.ts
┣ 📜LICENSE
┣ 📜machi00-win v1.0.0.exe
┣ 📜package.json
┣ 📜README.md
┣ 📜tsconfig.json
┗ 📜yarn.lock
