## Machi GPT Shad - Frontend

This project is the frontend part of the Machi GPT Shad application. It is a web application that allows users to view and manage trading orders and market data.

### Key Features

- **Display orders**
- **Visualize market data**
- **Manage trading strategies**
- **Track transactions**

### Technologies Used

- **Vue.js**: JavaScript framework for building the user interface
- **Vue Router**: Managing application routes
- **Bootstrap**: CSS framework for layout and design
- **Bootstrap Vue**: Integrating Bootstrap with Vue.js
- **Chart.js**: Creating charts for visualizing market data
- **Pagination**: Layout for data table pagination
- **Path**: Manipulating file and directory paths
- **Portal Vue**: Managing rendering to another location in the DOM
- **Vue Chartjs**: Integrating Chart.js with Vue.js for charts
- **Vue Good Table**: Displaying and sorting tabular data in tables
- **Vue Good Table Next**: Enhanced version of Vue Good Table
- **Vue Router**: Managing routes for navigation
- **Vue Sweetalert2**: Library for elegant alert messages in the application
- **Vuejs Paginate**: Managing pagination in application pages
- **Popper.js Core**: Library for popups (tooltips and popovers)

### Project Setup

1. Clone the repository from GitHub: `git clone https://github.com/machichiotte/machi-gpt-shad.git`
2. Install dependencies: `npm install`
3. Launch the development server: `npm run serve`
4. Access the application in your browser: `http://localhost:8080`

### Contribution

Contributions are welcome! If you would like to contribute to this project, please create a pull request with your modifications.

### Authors

- [machichiotte](https://github.com/machichiotte)

### License

This project is licensed under the MIT License. See the [MIT License](https://www.mit.edu/~amini/LICENSE.md) file for more information.

### Notes

This project is still in development. Some features may not be fully implemented or may have bugs.

### Contact

If you have any questions or comments, feel free to contact us at [machichiotte@gmail.com](mailto:machichiotte@gmail.com).

```
machi-shad
├─ .git
│  ├─ COMMIT_EDITMSG
│  ├─ config
│  ├─ description
│  ├─ FETCH_HEAD
│  ├─ HEAD
│  ├─ hooks
│  │  ├─ applypatch-msg
│  │  ├─ applypatch-msg.sample
│  │  ├─ commit-msg
│  │  ├─ commit-msg.sample
│  │  ├─ fsmonitor-watchman.sample
│  │  ├─ post-applypatch
│  │  ├─ post-checkout
│  │  ├─ post-commit
│  │  ├─ post-merge
│  │  ├─ post-receive
│  │  ├─ post-rewrite
│  │  ├─ post-update
│  │  ├─ post-update.sample
│  │  ├─ pre-applypatch
│  │  ├─ pre-applypatch.sample
│  │  ├─ pre-auto-gc
│  │  ├─ pre-commit
│  │  ├─ pre-commit.sample
│  │  ├─ pre-merge-commit.sample
│  │  ├─ pre-push
│  │  ├─ pre-push.sample
│  │  ├─ pre-rebase
│  │  ├─ pre-rebase.sample
│  │  ├─ pre-receive
│  │  ├─ pre-receive.sample
│  │  ├─ prepare-commit-msg
│  │  ├─ prepare-commit-msg.sample
│  │  ├─ push-to-checkout
│  │  ├─ push-to-checkout.sample
│  │  ├─ sendemail-validate
│  │  ├─ update
│  │  └─ update.sample
│  ├─ index
│  ├─ info
│  │  └─ exclude
│  ├─ logs
│  │  ├─ HEAD
│  │  └─ refs
│  │     ├─ heads
│  │     │  ├─ feature
│  │     │  │  └─ persist_data
│  │     │  └─ master
│  │     ├─ remotes
│  │     │  └─ origin
│  │     │     ├─ HEAD
│  │     │     ├─ machichiotte-patch-1
│  │     │     └─ master
│  │     └─ stash
│  ├─ objects
│  │  ├─ 00
│  │  │  ├─ 1204e17310a303388d85b2233e43657ec7e85d
│  │  │  ├─ 6a9031fd38ae90f6cc460f348394e948cd64e4
│  │  │  └─ fa2bc2b27c5ae649f04b2ba7435c2fbdbc359b
│  │  ├─ 01
│  │  │  ├─ 415bc99e96590160136a40b173f4f9f26283fe
│  │  │  ├─ 8a83cfef5670dc0cf68c71220b3eb89fc86bc6
│  │  │  └─ 997d1b0d946e3921edefafc499adec47b7af24
│  │  ├─ 02
│  │  │  ├─ 2637206b2c9590d7cafa330f9a69c80a75806c
│  │  │  └─ 6da890eacb8dbcabfd274b30e64eb3da7c13b5
│  │  ├─ 03
│  │  │  ├─ 284a717f0626ae4b6b32b3c8d5815a6f4002c9
│  │  │  └─ f6b5d06776f7be05c26063ca80f10c1d4b8645
│  │  ├─ 04
│  │  │  ├─ 11aa98cebf8dbc42d41b2a2e06802882055bf9
│  │  │  ├─ 1656e540a186ca661433507c0148f01f0fa838
│  │  │  ├─ 5d4d49c42df3a1c61a70b3f8a03fb072b164a3
│  │  │  ├─ 88abead174de26f1dd729d62ae9392193bbb13
│  │  │  └─ bb6ee580559e6e5b96a0c54298b4a3d4547c3c
│  │  ├─ 05
│  │  │  └─ aecade6900a43586d8f889afedd8242eef8ef1
│  │  ├─ 06
│  │  │  ├─ 1494f6a44924589dfbf3004361d2be7cbf529c
│  │  │  ├─ 61d619247eb5be3e24d0cec85f1cf970e72dd1
│  │  │  └─ cad575c7fda03a092a275ac07bda1a59723425
│  │  ├─ 07
│  │  │  └─ 40f8279808e4e0db319a39aaacdec20dc1b0d8
│  │  ├─ 08
│  │  │  ├─ 0e1cd72d296aec5bef3e14fa98fb8f6d655143
│  │  │  └─ 9364c59c4b80d608be25c4c7be78eeae185a43
│  │  ├─ 09
│  │  │  └─ bcb7ff7187718c81b8c90a7642ee68cda69333
│  │  ├─ 0a
│  │  │  ├─ 3ae8f320efd980219e20d9304f7211bf38b935
│  │  │  ├─ 3af0e0c7bf286ef379af2e87f67b274afbf5f5
│  │  │  └─ 7810c39af5226ce9227abffd73e994885159b9
│  │  ├─ 0b
│  │  │  ├─ 5a57868ae28340e07c5ee2bfbef53fd817fe6c
│  │  │  └─ 6ce64dc1b430ba47c5480c3aaeac4b18f189ef
│  │  ├─ 0c
│  │  │  ├─ 581fb04982d0f69597086a04acd2d42d8ff5ec
│  │  │  └─ fadc443e25fefd9559aeb8e73d98d529c100e4
│  │  ├─ 0d
│  │  │  └─ ae8e7e6ccd984d74a22387ce3df8c66008f25e
│  │  ├─ 0e
│  │  │  ├─ 751b5d5f542b77e0b2b0beff2c569a2d51af71
│  │  │  ├─ c49f3cb8e0267c80946a5df9456ec66b15f463
│  │  │  └─ f54dcb46e4d7fb889d6bbfa85120534e0a003a
│  │  ├─ 0f
│  │  │  ├─ 018ec50d04624ffaf9f079c8f1f0c9d40e9d30
│  │  │  ├─ 272ab90f0b3395622ab5cf7bf5b67954d95934
│  │  │  ├─ 3b224fcd710d8d3ce9162ffa9f3c194bfc8253
│  │  │  └─ aed8476b037739bd1d513da6518ab51bcd91ce
│  │  ├─ 11
│  │  │  └─ 7a00ee90e37a9375900cd4b65a4639942d7705
│  │  ├─ 13
│  │  │  ├─ 207db13e0949413d636bd90177d5d9c8f21899
│  │  │  ├─ 6469d21346d85c0fd0d10289feea985224c8e8
│  │  │  ├─ 9a731a340101fe05f4caf29b3ca421602fa9a3
│  │  │  └─ e241cdcd99300aa17561d91b0c9148019f4be3
│  │  ├─ 14
│  │  │  ├─ 357466730ccc7ceea36182f846f3c880cd700c
│  │  │  ├─ 944f35549215df330a41aae999311f6055a1bd
│  │  │  └─ d65ad14d09cd6f42e6119ba1bdf902a4678873
│  │  ├─ 15
│  │  │  └─ 395e4951e592ca9c2fbe927eab38cd1864605e
│  │  ├─ 16
│  │  │  ├─ 2b63efeabab3de83ff99ab5d2808ba78db88f2
│  │  │  ├─ 7dd3debaec07c8df884f7d51b6bf289b4be0cd
│  │  │  └─ 85b889d77758f8962dbddee232c932812d0278
│  │  ├─ 17
│  │  │  ├─ 222b6ecc2f459006c6ac098654c8dbb44d33bd
│  │  │  ├─ 2d028d8dde19269b19b4c849f86df14d48e4e5
│  │  │  └─ a6a1188dc5eeed81da1ad625d542fdc36f11f4
│  │  ├─ 18
│  │  │  ├─ 21cb1d90122c04b3e1db2c5cfb5eca665deed5
│  │  │  ├─ c2ca8d17486eb4a7b2c6063cea2c903b617107
│  │  │  └─ cd879bd80c68913975629a20bcf3355c3bd8be
│  │  ├─ 19
│  │  │  ├─ 676c76096387c79e5e9f02902b62aa95ec1087
│  │  │  ├─ 8a8002cc9adc2f12c4ca73d7aa830370e30e87
│  │  │  └─ 90c122a89417415c5175878341926606abca3c
│  │  ├─ 1a
│  │  │  ├─ 71145f8b8b4f13f398956e68b2cff97d8397c9
│  │  │  ├─ 7d3fca77e84809a7444719ee91c81efa98380e
│  │  │  ├─ d3eae0ade99dcfd8bfa41346e23396cadd062a
│  │  │  └─ d4511039ae4e4d97f4e3e7b8f596b6ed7f9dff
│  │  ├─ 1b
│  │  │  ├─ 21b49eb799e2b76dfab11862cb15304b9d515f
│  │  │  ├─ 5c40cda8f03d4b3500af3f673bd1a6114a3208
│  │  │  └─ d84dabc7ed5de3b1dc66dc0f5da78ed9e7b2aa
│  │  ├─ 1d
│  │  │  ├─ 5ba8a999f93cf73f1c9351330c5aa34f37840f
│  │  │  ├─ 85135f7f4139be20bc6e48e65c93655b8f9d3d
│  │  │  └─ b8fdf5d744d6e121c0e11fc37ba73a79a0585e
│  │  ├─ 1e
│  │  │  ├─ 0c3aef2cb6fc74c02c526a6e8d642f75ee443a
│  │  │  └─ ae41214a06a8e611a6c9a2e1ac2f7574998226
│  │  ├─ 1f
│  │  │  └─ 87ada29dc1bb20614de17ee59a1780c3a0af36
│  │  ├─ 20
│  │  │  ├─ 2e30ebda19c653508dec3cdd0630489f8caf74
│  │  │  ├─ 5e7bfbd1672739b13e5a67adf9e047a7047f31
│  │  │  ├─ 70c7a500254a3466cc63bab7e13f8201b3d3d9
│  │  │  └─ 94f9c281deff62ef2d1049a4738fdc8f2f15f6
│  │  ├─ 21
│  │  │  ├─ 69b2362ba5b81df33b2b11165d1229b8d91413
│  │  │  ├─ bb4011739a40643ebfb12f926d536b1c814b66
│  │  │  └─ e1ddd145351af74b855f97a182558114b07460
│  │  ├─ 22
│  │  │  ├─ 19ca3b330a7a13b050d0828a647b806449b3c3
│  │  │  ├─ 19fc55c5a98203727fd1d288418f5e5853835b
│  │  │  ├─ 9e4b5fe04ebba10199c7e208b7f9a658e632ee
│  │  │  └─ b60bd4b2f1f88bf8ae677358b710acbb1ea76e
│  │  ├─ 23
│  │  │  ├─ 2fbd27a221d3b9b3d8fe65bfba3c96a65bf82c
│  │  │  ├─ 629977afe349fee2a73d2d60484d78b3a4066d
│  │  │  ├─ 8421b78bd63e333e60443fc1ceddf220129154
│  │  │  └─ dba060dce82653c69d01f9de402498b2edcf0c
│  │  ├─ 24
│  │  │  ├─ 4c607e698352fea174006a4b58e7f214c36afb
│  │  │  ├─ 82fb17b0fcceeb998dfe68420cfba066a91da1
│  │  │  └─ f449d1ed6e668c2c5a4acd86c62e852bc9509b
│  │  ├─ 25
│  │  │  └─ 442dfacb1701415e7ce81c424e42b206ee7e4e
│  │  ├─ 26
│  │  │  ├─ 2a065293b00554b02e9070dd67318ec8cd6321
│  │  │  ├─ 746db0ea82a8a1b5fda7c4419eb0974b31fa77
│  │  │  ├─ 85bd75264bd386e44c11ec97d9d9ad733ad94b
│  │  │  └─ 8f9b251ac0849841ea4f28de716c3ad1f2a1e7
│  │  ├─ 29
│  │  │  └─ 1dfa68b26be489dea1f4be35a795c9c8e0b857
│  │  ├─ 2a
│  │  │  ├─ 0a862fbd73e151756665552cbe54c7165f1c3e
│  │  │  └─ 947ff364bf56de4c9865407315cd56a43ea1c2
│  │  ├─ 2b
│  │  │  └─ 46477b5b9d4b4e6d711dcf2d7cb4d2f9da2cdf
│  │  ├─ 2c
│  │  │  ├─ 3eee0dfabe552acd8bdab841e8c08400209fe3
│  │  │  ├─ 5e6e70c0d5788ba35ba69880a972a2f7df3992
│  │  │  ├─ c0d949fca9cc3069118d00b602a95ad4cac620
│  │  │  └─ f536fd376666bc7a11eb570a109229ae25ac19
│  │  ├─ 2d
│  │  │  ├─ 1622a38042d054662a2ee8fb9063813d7c3df8
│  │  │  ├─ 96bbd6d3730afc5ebbb21f97ee2fed9c8af591
│  │  │  └─ b19627a6f2c4305a60f35c17743fa30ea0fe98
│  │  ├─ 2e
│  │  │  ├─ 0fdeeefe5a3d19c470973bddfc63640056208d
│  │  │  ├─ 93d17d308a0011d9f538a71842e522543d538b
│  │  │  └─ ecaf097d8f5dc9e925db053baeb572226799a4
│  │  ├─ 2f
│  │  │  ├─ 2faec3c92df1d2bd350930a2c0f91c1f093299
│  │  │  ├─ 6f78dbb1222a33c3284bbc4d7cc0c905cacb41
│  │  │  └─ aeec120020eace0a66c5b4f0a0fa2fc9d18c4b
│  │  ├─ 30
│  │  │  └─ be5678229ca43d1552920428d6ce723068efc4
│  │  ├─ 31
│  │  │  ├─ c6badbf1ed894d50d7ff9851dc6e7241944671
│  │  │  └─ e418a2eb82a2cb3b35849c4c519e2432dad92f
│  │  ├─ 32
│  │  │  ├─ 30400323b5c42244f342487ef803376f0bc521
│  │  │  └─ 60c874f1bc1555b73de61e4e89984abf77d962
│  │  ├─ 33
│  │  │  ├─ 0455ddd0833131d86ee377bbaf78fbd11c1ced
│  │  │  ├─ 0c44eb135073f310e5aeecf174fc4f4d2e484d
│  │  │  ├─ d0c9741d96fb0ef416ede343f791f7cfd669ba
│  │  │  └─ f42e408ef1460cc35ac45df1057532a43fdc79
│  │  ├─ 36
│  │  │  ├─ 411eba396346aba8d29162f6dae082999b4932
│  │  │  ├─ cc363926abe6ca45b882819e621bcc2b85d580
│  │  │  ├─ d8807c673c0e0d717e897cb90a276f640d9969
│  │  │  └─ fff119ac364c251f4b8f09dbd05f072ffe59e0
│  │  ├─ 37
│  │  │  ├─ a749e1dd8908b0497e2c6a1572d58a4219714c
│  │  │  ├─ b90f14ee3a3d0c5f1b69e94b0a962880309b88
│  │  │  └─ fd1996d2daec699af4b38caafa936fc411bb7f
│  │  ├─ 38
│  │  │  ├─ b526b8c60f40cbd782d67a2cbd7ecb500261d3
│  │  │  └─ c4804a329656f0b227e0642d1a0d0114fb5eb3
│  │  ├─ 39
│  │  │  └─ 4ae6af4fa8fbd00b7aca3b839fb152934769eb
│  │  ├─ 3a
│  │  │  ├─ 14e136665aebba446273f389e39e27c7510e33
│  │  │  ├─ 3eb7a8d961c17adac4364136283cc6422449f6
│  │  │  ├─ 74b41da66c54b3f6ae72470daa469cb2ab10b3
│  │  │  ├─ 8e634f28e7a01a2be5af2b5acead25646fe6af
│  │  │  └─ edca28106ab54642cc74b954afef342cd4d616
│  │  ├─ 3b
│  │  │  └─ a4df1febf2b284d45512cc29c53025c626c3fb
│  │  ├─ 3d
│  │  │  └─ 209834a76c18f3def4a8a06e7e2c45fdbfe184
│  │  ├─ 3e
│  │  │  ├─ 3e4dcfba1c68f2ad50dbaf9158f5811ae4c21f
│  │  │  ├─ 91529a1671e855577e4092f664ce6eb9fe5d10
│  │  │  ├─ ce08711bcad4e6da1a54fd10871d2f4f45cf1e
│  │  │  └─ f61762bf391c8e0f405c1a94182d0257601771
│  │  ├─ 3f
│  │  │  ├─ a34ddfabac4707ef0671168d66bee6306372f8
│  │  │  └─ e7502bac9d03155f71e68139544feacd14740d
│  │  ├─ 40
│  │  │  └─ fce392eadc2871800f7a9bdda2b08dbdc7b67b
│  │  ├─ 41
│  │  │  ├─ 0879f4e62cdc3ead500957bd41e4f306ddff3c
│  │  │  ├─ 126be9e03afc25796f87f2e200fb1e9dab8781
│  │  │  ├─ 1c4543118a05b3fd50008a150a7c5887e705cd
│  │  │  ├─ 5efcfb41c53809cafc08df2a3e65d22e243624
│  │  │  └─ cd93ff7ad23c9047a0254622fa03fde7b0766a
│  │  ├─ 42
│  │  │  ├─ 1e3930a1f92f8d347b12618e782cfbed97e8a8
│  │  │  ├─ f54c3415cff3cd343c5e627211922a5aa203c4
│  │  │  └─ fceb4f79b3e155052ef28b47742e949ec6978f
│  │  ├─ 43
│  │  │  └─ dfcce8ed80eded4ef4cfc65ab70d0221251050
│  │  ├─ 44
│  │  │  ├─ 4486e7e02b895f29685c1a9abe12e8e2925f2a
│  │  │  ├─ dc90622d8856d54a84b70e6850790b9fb2688d
│  │  │  └─ ea36aadc168e39249d44ba3c02bbbe106ba472
│  │  ├─ 45
│  │  │  ├─ 357eadcbb3c0cb41b14df37b156df79ff697e5
│  │  │  ├─ 68a87abf51069116651c27397d2ea0e17daddc
│  │  │  ├─ 71adede178898fef96f9471f070dcd8fdd687d
│  │  │  └─ 860a82899204e5fbd5016c6fabebf9288b587a
│  │  ├─ 46
│  │  │  ├─ 1cfad623f659fef7097ac73d0b5f2f39fd715a
│  │  │  ├─ 249cd1134fd7582149050467b7a924654627fc
│  │  │  ├─ 3562248cfca1ddd1e110f4db26c7f082439073
│  │  │  ├─ 3b1d84a64390972262fb686d7f1db88a0ade64
│  │  │  └─ 79e5ff01736adffe30702d740511db84a62835
│  │  ├─ 47
│  │  │  ├─ 3e245b80c1e58876cbfe5d4bfa23ea9ba4d7fa
│  │  │  └─ 799b0f991c17c2d8f5943fd9301291e4242b71
│  │  ├─ 48
│  │  │  ├─ 1a05605801dcb74dfdf9c6d360262baa53f309
│  │  │  ├─ 3b8c9ac18f9f06082adcbac8bf7f31a6a2be72
│  │  │  ├─ 3d195f023a820efc2ee627ddb2500e344632f5
│  │  │  └─ f4581da668e69b1af1ccdfda4d34f06bc5deb7
│  │  ├─ 49
│  │  │  ├─ 8ade368dd3b2d2eb081bad3154d94345c9853f
│  │  │  └─ fda274f4f1c4a29e05694b1b452c9f6e03922e
│  │  ├─ 4a
│  │  │  ├─ 057daa9f5ca1b9ee684dcbe0f3664f968013f9
│  │  │  ├─ 15df0ad530af868c9ab1de5868ebf0b382f609
│  │  │  └─ 58e62c1f6aa44fe8985253f60068a5f93aca4f
│  │  ├─ 4c
│  │  │  ├─ 5c735b2eb346c024bcfb5fce8f8a8fdb4c7f5f
│  │  │  ├─ 99fd7c401d815059e03181e365b5647b0b8e7f
│  │  │  ├─ b2f2627ee1db7a4b7e362b9e6370e731c47805
│  │  │  └─ e1f8d306121a51439e4c3d476a4d1a9642747e
│  │  ├─ 4d
│  │  │  ├─ 0e0f195462acbc85e883602b68d53b6ce4485e
│  │  │  ├─ 2219c6bf200cff2132b32747ce264ea39cdc94
│  │  │  ├─ 3d4330785b02fd6f4bb7e7533426fab51985f2
│  │  │  └─ 9b36c1fe8e3613619fd02ce0c11cedec70160a
│  │  ├─ 4e
│  │  │  ├─ 8e58992c62569a6ff505e7acc0373c70f1c741
│  │  │  ├─ 951b64495c048f030525a535afc6eeb5367746
│  │  │  └─ 9627975349c288338ff390e233a32d56b21f1b
│  │  ├─ 4f
│  │  │  ├─ 548d94c6f1ad817ad0aa215d9e41b39f595131
│  │  │  ├─ 91fedf96d47338df4af58ba5732c75c1855b8c
│  │  │  └─ a8bb81dab58c3203196bafd52577cab184b575
│  │  ├─ 50
│  │  │  └─ f093f2ac97eaca473dc04fe1cebe2ad3b27edf
│  │  ├─ 51
│  │  │  ├─ 29407a55a7b6d47bf2a1ee8ddc8cf6af6ff212
│  │  │  ├─ 31e386fd3a21772e5dc0701fbac0ae9b315928
│  │  │  ├─ 4dc733df9c0a9ae49762f0f10aa32a26cc10fc
│  │  │  └─ e76be9b7a208412699d116ca33403a6de399ad
│  │  ├─ 52
│  │  │  ├─ 86e24b0e4c997df35d602c8e3a213f0c51efeb
│  │  │  ├─ ce2020082d2c60e8efd324711384a81fc11fe1
│  │  │  └─ f629f4b76fe57960c278c1ec2a2e1a6cc7652b
│  │  ├─ 53
│  │  │  └─ e022c9138b0bfdc929ff63b8603e52ad061751
│  │  ├─ 54
│  │  │  ├─ 67d059f723ba0117fd52d13a33de28e4ddf7a9
│  │  │  ├─ 8dc66c6e364974a8b68926176d528b21016009
│  │  │  └─ d3786ac24d36f9d94496f61fb7131823ffa413
│  │  ├─ 56
│  │  │  └─ b704b989d952e76eb3e220c2a7f4ee2830f36c
│  │  ├─ 57
│  │  │  ├─ 1454291416fa7f13bfefdc04a2396e7d3e0eee
│  │  │  └─ 5611c0b4559fcf78253c38bbe5909fe0299643
│  │  ├─ 58
│  │  │  ├─ 2600c301e2218d607f253b33addd6cda172584
│  │  │  ├─ 428792a16ad874fd51ccce9a931a697ffb3374
│  │  │  └─ 4c9fd0d321a6f599735fb7824cf6af1882efbe
│  │  ├─ 59
│  │  │  ├─ 02250eb20a3537fd40c75e5496abe910a12928
│  │  │  ├─ 17b477382ce7245eb72fa8497b8168a0de4836
│  │  │  ├─ 749f87fd6b8b0574c7661519daad12ec43ffd8
│  │  │  ├─ 83a8f62b1c4da38f71487c7277eb94900d8ad8
│  │  │  └─ 8807273451f0ec3e40f4ca16a5a03c9f8fb8eb
│  │  ├─ 5a
│  │  │  ├─ 0bc0de9f27343be6b73a2a09668ad19657fb76
│  │  │  └─ 911685090a14f18bf16800226cf2a187d05e4c
│  │  ├─ 5c
│  │  │  ├─ 3ed802be5a1a5322d8519913226567f10e908f
│  │  │  ├─ 5a155d277f5aa50b1788ec16ea9198e5320e6f
│  │  │  ├─ 64204c6ed7a60d14a695780414193d14159041
│  │  │  ├─ 8248eb68de2e592d6f437cefa69a6164442a4b
│  │  │  └─ c3561ac08c41125b970158c2316d6ef0558106
│  │  ├─ 5d
│  │  │  ├─ 03ab650663025dcec5e24ee74b7510d339f34d
│  │  │  ├─ 4e280f44d07ca042a6e3c30f468b0e1e33bb45
│  │  │  └─ 5f4a14ea7dbdf01d7c0f9203b9c04574f78ed0
│  │  ├─ 5e
│  │  │  └─ 28bff8cfe915d20a5644e58703cbf2406b20c5
│  │  ├─ 5f
│  │  │  └─ 8c98f6875a79c49e5e2ea156d944e327b5a4f5
│  │  ├─ 60
│  │  │  └─ d7d825ee58833d527af949988daeb661e5969e
│  │  ├─ 61
│  │  │  ├─ 2e6eb24d10c999b4b3b13fa858ea92a809fad8
│  │  │  ├─ 458dc2889989ba2d144c07ab3aabf48ea0f354
│  │  │  ├─ 51e0859210e907e9098127e3e58eaf494ff4e4
│  │  │  ├─ fd7b18880ceb2e3a16fc35ffcfc88037830583
│  │  │  └─ fdcfedf504253b4cbc74d8d95ad92ae5ccbc6b
│  │  ├─ 62
│  │  │  ├─ 2ff6eacea3dbba2942c6826b31decd85ae35a6
│  │  │  └─ ad8b1f931097596b3164de178d65c528435a22
│  │  ├─ 63
│  │  │  ├─ 350a385900494a54333873ef0a58231ed23bce
│  │  │  ├─ 5bb2635325bb7b2dd18a8ecb47bf25594c2c05
│  │  │  ├─ 6b77aa5333cd0868ef5afae8fd5effa0a56241
│  │  │  └─ 6fa024a8328bad62c8c0e795a87cc62ebe2b46
│  │  ├─ 64
│  │  │  ├─ 5b1e9a3cc6442ac19fe609c4115b2a1b57d008
│  │  │  ├─ 70b97410eb7c81c58b5fde0ca28088380a2c52
│  │  │  ├─ 79299ee60931e3bc7b388b84ba2a04d7653002
│  │  │  ├─ 7accbaa6f498fc533f8e6575f8fb62741b84df
│  │  │  └─ e5c3846e51c81ab1691a2257f6205014a247fd
│  │  ├─ 65
│  │  │  ├─ 3052bb66dba31f0011edc912c47f5ecdd41a92
│  │  │  ├─ 618d1fd5dfa9f74a53b1a294e1c76519b323d0
│  │  │  └─ 9849fededa3f36ea0052fd1b724cc217af9f03
│  │  ├─ 66
│  │  │  ├─ 74d94307a87cb2f32381deb5fceffda107b673
│  │  │  ├─ 75e95743b47db2eaae69acd2f71d186590cac8
│  │  │  └─ 9ef50121033c1f9933ae1b68fb11c33ccf300b
│  │  ├─ 67
│  │  │  ├─ d87c291041adc91f4361f1df850849742320b2
│  │  │  └─ fca127525ff05e13dcc54ab7536a32d09cec14
│  │  ├─ 68
│  │  │  └─ 08e9e1aef7926ca20e990f108b73026e8f8411
│  │  ├─ 69
│  │  │  ├─ 010160a21a7ac57d0cce00b726a8a130bd6065
│  │  │  ├─ 7bb141eabc52a050aa76b046020336b13d96b9
│  │  │  ├─ d65f20d742fc261a06cb3348eb8a34c008c5a9
│  │  │  └─ f7f04ce5a2cbf53ea86abab0670829f423ea97
│  │  ├─ 6a
│  │  │  └─ f775c272f04690d93e3d7f7af88c434c3f2503
│  │  ├─ 6d
│  │  │  ├─ f99a459501ba9974974e2f91fcd926b5a5c6b1
│  │  │  └─ fd6fc350fbe536952e6b74c2ce29ca5a9d3506
│  │  ├─ 6e
│  │  │  └─ f747ccaca1ca9d43390b9712ef607108d25a24
│  │  ├─ 6f
│  │  │  └─ d2bf02e18d96c1ba08354e764e35c0cff06450
│  │  ├─ 71
│  │  │  ├─ 1d5a159f98fbd1ad51ca37f11d1a7319cdba72
│  │  │  ├─ 53288782aebcccc9e687a82734580f09892e96
│  │  │  ├─ 612abe49b13c4d1c8b64ecbe8f9290dcedb487
│  │  │  └─ 92fc6de7c5d39826dfb967871d3a7f9f358901
│  │  ├─ 72
│  │  │  ├─ 24177ffcefe6f6b0e2a266b1e011c2f4b06cb1
│  │  │  ├─ 7c4c2a01a42b7b931ed4d41754c9611c31396f
│  │  │  └─ 9679f13eaefaea8e0b356c2e3a4b3153bc2bde
│  │  ├─ 73
│  │  │  ├─ 30165f077f6df34c109e9ecd90594661a6661e
│  │  │  └─ 8aeb2351592b0dd1b3784f9cbb040ade31c58b
│  │  ├─ 74
│  │  │  └─ 86853a3b269fd0f84d2bdb0fe88dbf87a4ac4f
│  │  ├─ 75
│  │  │  ├─ 40a94c4e7e78858141a1d8489d01dd78cc4bad
│  │  │  └─ 71b47607152b135319acb12c54410d3dbb5a54
│  │  ├─ 76
│  │  │  ├─ 1c7c04646ccff605485c8720ce434c7cb22741
│  │  │  ├─ 2b4ae986fd9961f6bd55ffaf313f3a9cc4e6a6
│  │  │  └─ b9c07674aa848608d2ca6f0cf6f2543cd0e0bf
│  │  ├─ 77
│  │  │  └─ 8c9829e56e2cfa0738416cdab62429d2081e74
│  │  ├─ 78
│  │  │  ├─ 5f2a74f760875b7e3353c6493afd08647f62af
│  │  │  └─ 8a7cebda727a3b5902586e42f7254278ad0863
│  │  ├─ 79
│  │  │  ├─ 898b0287df442181451855c356786cfb4036e2
│  │  │  └─ cdbd81f1c04e7f8e8526510a59b84bd0bd7cf9
│  │  ├─ 7a
│  │  │  ├─ 63e8ebe067556a5747121d304926f686ce8f37
│  │  │  ├─ 99985334cf749ed8a628395c5a6c26159fa921
│  │  │  ├─ bd5c02350bf37cfdfc4fd4955794c6f8c387c5
│  │  │  └─ dfa1058f82ca46437e19be3b10570a0d182642
│  │  ├─ 7b
│  │  │  └─ a70ae764aaa3522d3f994c7864951bf517c9e5
│  │  ├─ 7c
│  │  │  └─ bec1e229bef41ceb7daa176b1cc6410ef32619
│  │  ├─ 7d
│  │  │  ├─ 1aeb7ab277edacf33984ebaaca633030ebc877
│  │  │  ├─ 81cafb2c72d84cbc3a11c04cf367229d656f77
│  │  │  └─ 9f763550e5f7b755b532895e3f05ecfcae2371
│  │  ├─ 7e
│  │  │  ├─ 1502496afce3cb4fda8a1ae9f0b06f5e12393e
│  │  │  ├─ 66f3bf7f72654d82ed367a3aad9272d5f6c509
│  │  │  ├─ a98e9695a3afeba9d5e26623f0f2d7688fd180
│  │  │  ├─ b3a2757487039a489c4b6b122e580514870815
│  │  │  └─ f0f6fc36199a45eea52dcbf377921fa031ac12
│  │  ├─ 7f
│  │  │  ├─ 4f2c4a48134e33e8bbcd7b493f6ce1a342ce6c
│  │  │  ├─ 90a3479cd8822084903f0c001f77912ca53b48
│  │  │  ├─ df971f229eb5d20d383e87d8568b2fd1839a1b
│  │  │  └─ e95a8a60e0a044a898dc66aab16076ce055812
│  │  ├─ 81
│  │  │  ├─ 6315cb6db962df9e170de14cbd8ae82e3805a0
│  │  │  ├─ f23ac09d83cd35e4c836f3856f71851acbfb0a
│  │  │  └─ f3082b149a9ede7d2027c4c3d272503404e5d5
│  │  ├─ 82
│  │  │  ├─ 0eeefd496503c4ffb78e47f15af4419a376c1a
│  │  │  └─ 3d479e8312febfc8a00ed47a0027c56de29a83
│  │  ├─ 83
│  │  │  ├─ 13648f8ce4015583509e6cdfa5354c098a1941
│  │  │  ├─ 3700aa3027655177db3bc6fdd99d327a4be7d2
│  │  │  └─ 9957081edcf3c1b4c3cc51d0ba734723439bc1
│  │  ├─ 84
│  │  │  └─ 3fdc9eb57732970c2f813e543b77062cb424cd
│  │  ├─ 85
│  │  │  ├─ 46af159e774d47c369c528c610aaa2a3d98fe1
│  │  │  ├─ c5421c61c472e97e6403acb038276540c9c6bb
│  │  │  └─ cfbc26a59a2f50b4eaf52a9d381648e72b6f66
│  │  ├─ 86
│  │  │  ├─ a9a2d9aec2d1914aaa85cde5cb8f89f534c49e
│  │  │  └─ fb9652304c25d10261f98b21b1ffe4ed5a5da0
│  │  ├─ 87
│  │  │  └─ bd54737d38570cabc6c7ecf15ad5dd808d4866
│  │  ├─ 88
│  │  │  ├─ 49fae2ef82f6f5b0292a82420fd45e0ef521f0
│  │  │  ├─ 51b3048cd6a28a56aba583f12b3074afb197da
│  │  │  └─ 52db6852c900406bcd13b83b0fb502283beef2
│  │  ├─ 89
│  │  │  ├─ 0d58910ee6941aa75bf59cd5218c53419c4a89
│  │  │  ├─ 9008674b5e85decff68778809fb5c9a3922275
│  │  │  └─ 9d448c87c21662c27a04ddb708e96c4b1e98fd
│  │  ├─ 8a
│  │  │  ├─ 133f2124264b60c06b5d9686a28ed67ed1ee2c
│  │  │  ├─ 2514a1e6e7d7688610abeaf16e446bd229bda3
│  │  │  ├─ e7c63a2caaa5e9b321494076c5dc849e65294d
│  │  │  ├─ e80d75a5ae8752b58fb57436bbf241512c1021
│  │  │  ├─ eb9e416dae678671ade009e7f7342e44645266
│  │  │  └─ f8338f03d003e3c721f1322f6125cfb7410941
│  │  ├─ 8b
│  │  │  ├─ 43ac9582b0786b8be3ce1a5fbad455f9b7f55a
│  │  │  ├─ 676b03b4019e4b1efb0e97a187dae35fe7ad43
│  │  │  └─ ae0f24bda3f77bf8228c493ccfe3cfff963cab
│  │  ├─ 8c
│  │  │  ├─ de7200714675fa4e4b220cb3047aa9bd1ffcdb
│  │  │  └─ e021ea005b0ed17eb85f31be69ed8132387f5c
│  │  ├─ 8d
│  │  │  └─ ca2a86b740ee619bd2d0d8266d568d6adff369
│  │  ├─ 8e
│  │  │  ├─ 0788268e34e7ca98b63db3e5f59b203f945570
│  │  │  └─ 9642450e66423bf50abff64c38df745484076a
│  │  ├─ 8f
│  │  │  ├─ 56cf69b6f3a7e014e7dd056d454889550862f5
│  │  │  ├─ 7ba55b2a3c3bc28c5016dd1e8966937d27ad92
│  │  │  └─ e6513e35f5f05f01de1204ad110591a5b98c37
│  │  ├─ 90
│  │  │  ├─ 88d20b9798a529b6c2254b4e0e205f0b4f75dc
│  │  │  └─ 9780a992ec80b5c0b89ae611b82072320d1a3d
│  │  ├─ 92
│  │  │  ├─ 76cd652bd28e4b6e03ff88dacb2cc698e44860
│  │  │  └─ aa615a6d8510e18635ba109355d453752651c9
│  │  ├─ 93
│  │  │  ├─ b8079f5aa27e239b72ef2ee8cdd0ed66cce01a
│  │  │  ├─ e0ffed9be0a39f14b54c8bb57aa9744dd2aab5
│  │  │  └─ ee6477b2d7e78c23dea1a39b55296eec3cd203
│  │  ├─ 94
│  │  │  └─ 869cec7d1db7a38598d6d85f62e7cfb6146897
│  │  ├─ 95
│  │  │  ├─ 045ed29bee516670a0ab95e1adc566561ef47f
│  │  │  └─ 568da6cd000af33a6694aea5fcdd209ee67e42
│  │  ├─ 96
│  │  │  └─ 9edcc412c2dbe8eba8dd1053e7e37f85a8f169
│  │  ├─ 98
│  │  │  ├─ 495e275521051629b20e9731ab8b373f6e913c
│  │  │  └─ d983fbab381b8fe08c71093ff32a5da1709da1
│  │  ├─ 99
│  │  │  ├─ 3479c669f7c78e855799b27bca52a8c55dbb87
│  │  │  ├─ db106e257cb31d98a24892faead810b925a4eb
│  │  │  └─ e9835c230b1af5f749a3fe171c8de804d4162a
│  │  ├─ 9a
│  │  │  ├─ 3ded027ee3755ef7f4b83ea613214a6acff5d4
│  │  │  ├─ 93edaf90fea8a53387f615d5247a1b3d665263
│  │  │  └─ f26fe91e6f698c384a3eda5f30f6254ba09ad7
│  │  ├─ 9c
│  │  │  ├─ 0dd9cbace1ba765657948dd967aff5d02f0973
│  │  │  ├─ 522e3694c230da30b90111db9be9e647bdeaf9
│  │  │  └─ bedc6f62a5af05e61e067ba39f2d8518aeda93
│  │  ├─ 9e
│  │  │  └─ 8183acdfae8da26fe8d098fb222c3db3ce03f0
│  │  ├─ 9f
│  │  │  ├─ 09dc2cef35eee852d2753d5c84d290b3b52965
│  │  │  └─ 7c8b540e0be44897ea31fddecf46cac89f4d96
│  │  ├─ a0
│  │  │  ├─ 5a653e227d7b1b2a5f9e56dec2917cb267bf58
│  │  │  └─ a0ba3496a90054749da1002a5bcd7d3cb6d2aa
│  │  ├─ a1
│  │  │  ├─ 2e910ed935ab4131c8f4cf47db0488e2d1e6c6
│  │  │  ├─ e127323ae0901d4ea2ca6e1f7fdb2c38c04a33
│  │  │  └─ ed92afb7c9facc51081576ad4d84e15cabaf1d
│  │  ├─ a2
│  │  │  ├─ 263b569cf42a24cc609e623da59944c9fbd610
│  │  │  ├─ 28e43af0dd16a0b52eb19fa65af3535b901874
│  │  │  ├─ 56009d342ec6129972c46a971bbf7791534b82
│  │  │  ├─ a0862dba3b8e523f8d22d784754784dc0c4445
│  │  │  └─ a21123e2f9e5126e37d17f55fba1d2c7e950bb
│  │  ├─ a3
│  │  │  ├─ 4445f0c78b389de2350311c918c457d1918733
│  │  │  ├─ 4f465f3adc5fd691ae63e8967105bb8dc4e668
│  │  │  └─ fc98d015f30cc9b52dfa2595b5801aedc92b9a
│  │  ├─ a4
│  │  │  ├─ 8407935fc02beb2b0d7aac3ec244ed13012959
│  │  │  └─ b8fb51dd0b31380d14a076a57f802aba45d426
│  │  ├─ a5
│  │  │  ├─ abc6eceea58d59e3776753925b92848a5cc278
│  │  │  ├─ c20c5ae680bc3e124623776ec17bcda78a940e
│  │  │  ├─ eeba9c48148345fc3a3beb544714b82e762389
│  │  │  └─ fe8a76c1c2cb4515e47644289579414ad49437
│  │  ├─ a6
│  │  │  └─ ac1e6f0c7a3d0c1ca7e3610c773b46c8f27e15
│  │  ├─ a7
│  │  │  ├─ 0ce853c17a0df6422beec5540a3cf043967004
│  │  │  ├─ 3c84212e5927bdf58dfa891c465ac5dadc2fa7
│  │  │  ├─ 64d8fc8e7146ed4b3bacf61233d86ec5a7f53c
│  │  │  ├─ b9a4a27e0764498914881452e3a054f150bd15
│  │  │  ├─ bca925fe9313bba3ca4081607d73a8e497bce0
│  │  │  └─ c5eb81608b2c6166b20739a316a345ac2d18e0
│  │  ├─ a8
│  │  │  └─ 0f76b55af5cfd38569b5896e8a513b27570fbe
│  │  ├─ a9
│  │  │  ├─ 328d8f2942cce8546ddcf47b2a44e0b2ef1aec
│  │  │  ├─ 44515afedc126964f112bed56776d7cb212ea1
│  │  │  ├─ e5dec26a884a5d6775404b1cb5ff4dab287927
│  │  │  └─ fa03cfc516149d4f196589ccaafb73123f1e52
│  │  ├─ aa
│  │  │  ├─ 51b48f70ed31ab4d28413dffd06194e79efbe1
│  │  │  ├─ 9b238d3ef11671cc8ac3488fa47baf0dcb837e
│  │  │  └─ d1cc947ae5bcef4736739033f29bb9aee7abe1
│  │  ├─ ab
│  │  │  └─ 49e48aa500b617cdb1571e359c158012b8c0dc
│  │  ├─ ac
│  │  │  ├─ 4b9d07933e7ac8b3a2d8cd6332890bcf236d27
│  │  │  └─ 9b87951079d30d50f8bfead143bdd1b41f006a
│  │  ├─ ad
│  │  │  ├─ 92f8c242976ae9bc3b4f466545683fe050fa0d
│  │  │  ├─ 961046cfff8947ab18590497532b583e63040e
│  │  │  ├─ a36a4af5f63e0b8d3c31990950a88bd4d517d2
│  │  │  └─ c9814d5810192c2916abf189beccc1402c1de1
│  │  ├─ ae
│  │  │  ├─ 6fdded82de077f5e914e78ac7a2797c79cb763
│  │  │  └─ ce79bed324a527b6592ff76eeb41aaf327145a
│  │  ├─ af
│  │  │  └─ b961d983ffea148fc329667f11df65f206703f
│  │  ├─ b3
│  │  │  ├─ 3cba3a969cae907f177e9250ff02f4945abe15
│  │  │  ├─ b38304b28118201eeb86518c42914b5d8800ba
│  │  │  ├─ b519ed59a7cb54a896a4c633209fe7bcdd78bb
│  │  │  └─ ceba7456828eb3edf747ce7dcf623b2646479d
│  │  ├─ b4
│  │  │  └─ a72d68f7e5086752f4c7567cb29ed6ac7dd524
│  │  ├─ b5
│  │  │  ├─ 386fd995feae1df6578cf92cb520a4659d6f15
│  │  │  └─ 3c9ed4a8d258392c6c6545db0748633422e55f
│  │  ├─ b6
│  │  │  ├─ 7747711a5f03a84656f425fed3c6bcfed95d67
│  │  │  ├─ bbbbc91b457df0778551f4a661cdd37a3c24cb
│  │  │  └─ cfa816f793bb73b3e1e52492cf46a6f350eb2e
│  │  ├─ b7
│  │  │  ├─ 00dd8fc91d816efc6bdf7010b894124cebec0a
│  │  │  ├─ a8e6c2f19832719d0aea8a20111b63f2f69521
│  │  │  └─ eb2fb86e042965fe7293f42c9c8621258b39d1
│  │  ├─ b8
│  │  │  └─ 2f7ce05f1dbbd96ea250febb5212b69b7f9e30
│  │  ├─ ba
│  │  │  ├─ 6cac7d15d0f203b6f67a6f26621593168994fa
│  │  │  ├─ 734df3c79e1d0423ecc4f08018a1afdb2c6bfa
│  │  │  ├─ 7be7355b654864b6a16d8a15a186599fd4ed5d
│  │  │  └─ c1bc7b2c667f77dc7d1aa7aa7c5ff3f8c3b8e4
│  │  ├─ bb
│  │  │  └─ 60fc8839c76ff77d783c41b1b0f3d8bef3d000
│  │  ├─ bc
│  │  │  ├─ 4898a00946360f4acedc4577bead114652c809
│  │  │  └─ 9c9e3ff82973c33e366742f67903083167a16a
│  │  ├─ bd
│  │  │  └─ db242b596498bb2027396bbb62f3ca587a0116
│  │  ├─ be
│  │  │  ├─ 1c9a36aadfaf02e83440f630830654f479799d
│  │  │  └─ 50e6daf71cb4c67a34ef4e93c1c8898dc76a43
│  │  ├─ c0
│  │  │  ├─ 009104e431e3f51f0728e0f28b297f4c83a5dc
│  │  │  ├─ 34fbb608a46f9dfc7c2b9c4b654772b9a25b12
│  │  │  ├─ 52a863c2e4d6fb891ef5f8fc8af0729fb89516
│  │  │  └─ b694887398aad1343e4a5fb78689ea78af694a
│  │  ├─ c1
│  │  │  ├─ 03fbab26058206e074e1ca1d1c4debf30af37c
│  │  │  └─ 593bf7d89f297567e94256999519de4c86707f
│  │  ├─ c2
│  │  │  └─ 9bc2b9f77bbc0763f3560bf6d57f8d7af6ce64
│  │  ├─ c3
│  │  │  ├─ 66d5089fa3890cb49c590c58d838f946a2a5c0
│  │  │  ├─ 86ca8520da803adac0bf138d7639552b95248d
│  │  │  ├─ 98c68d860d81e9d1920cf1c1019e1e22e1c509
│  │  │  └─ c77d27a8e504d04485a0e305fa25a2f9a27cba
│  │  ├─ c4
│  │  │  └─ b9db1863cad10fc9048a6f2641c521d5d9f845
│  │  ├─ c5
│  │  │  ├─ 5d9b40987bd9b3b04ba102814c9570ba3bc0c5
│  │  │  └─ e5021c85b6d23e8dd12d5345046f49949556cf
│  │  ├─ c7
│  │  │  ├─ 0783e6f182ec0156552446cf6339561fa6c57c
│  │  │  ├─ 954c56863f0c9c2844513671581fa3e183ffee
│  │  │  └─ d5ee23fb8bb8834dc2dc76adec03ac80411e0a
│  │  ├─ c8
│  │  │  ├─ 196616a90734979de15130d13a256c10c7a6ac
│  │  │  ├─ 7a09b434d09058648715f33f1a8655ab9672d6
│  │  │  └─ c02f69a6810f009c7c6ec639e4a3fe9e519da1
│  │  ├─ ca
│  │  │  └─ a3734626a6c55f5ba307f5b6134a13ef29789b
│  │  ├─ cc
│  │  │  └─ 30779fe3b34f3d851b8be9d1702e7a8f989faa
│  │  ├─ cd
│  │  │  ├─ 39200dbe3189337de1edd01c73695608a6f490
│  │  │  └─ c9ef8fc05535e6f3964ccb2c6343b9b17522a0
│  │  ├─ ce
│  │  │  ├─ 0d164c4aefbc7a19db2157fafdffa7f1e5a499
│  │  │  ├─ 1ad7b6646aaeb605e14ad730568950f9d18ad4
│  │  │  └─ 9581e7a1a096695bf31f79f7b33c36199d494e
│  │  ├─ cf
│  │  │  ├─ 31d6afa88cfaffa90591879499a50cb78040d8
│  │  │  └─ ba9cb02c65f6a3355fac11094713e7df2eb4d3
│  │  ├─ d0
│  │  │  ├─ 1ec7aeae5fe97cb2aeafee2317806895f74ab1
│  │  │  ├─ 27ff4052946b0cd8d7def8c9ed660d6a57102d
│  │  │  ├─ 7ea2421ef7238db3fcde708807d2e663a50460
│  │  │  └─ 97bc9a2d7b397db1de9f54305aa9b823df22be
│  │  ├─ d1
│  │  │  ├─ 22ca9e2f7d5e4cdf05a92a968ae835310d208f
│  │  │  ├─ 3fde88eeadcc1442cc93a5b61951c9ecd5a164
│  │  │  ├─ 6a46aa972f9825e4097c044db6c2fe898c5e2c
│  │  │  ├─ c06c8e8845854448b965d6b108a6ebf0087849
│  │  │  ├─ c11a49624d34ece35c4ece9a678c0c9f7864c9
│  │  │  └─ d7e4f50cb2b0106a404e8fe9bb388218eb2f61
│  │  ├─ d2
│  │  │  ├─ 042910eb3ff8fd658fe034152236e176fbc6d5
│  │  │  ├─ cf272bc8c9424b45aadb42027db6b21416f2b2
│  │  │  └─ e539b7e9363cddbdf987cd690a2b98a6c16ed6
│  │  ├─ d3
│  │  │  ├─ 08162e194d2e6c8271bf8fd83805c0c03072a1
│  │  │  └─ fdb82da982aab07ebdaae2d0b98c8c0dcbe75b
│  │  ├─ d4
│  │  │  ├─ 09f85e9d451fec3dbf9471df57fd5a8293433f
│  │  │  ├─ 5941ebbb4ec68fe78bd9a7c8de50ecf7b266c7
│  │  │  ├─ 7d5ce2e5352e8b98f522bf0a5fc6b0d224e5aa
│  │  │  └─ f3a10975d8bd23769348a4bc8f9774b1dbd0d2
│  │  ├─ d5
│  │  │  └─ bfe58d5abce0a3238bbd7426a8021ab98ceb19
│  │  ├─ d6
│  │  │  ├─ 02d3b93cd42018e6f0b15888ff3c2edca54cf1
│  │  │  ├─ bb1befe7df8d2fc11ad4f60d00073f84f86073
│  │  │  └─ e1c0c07d815b171178eef4abeadb082161cf38
│  │  ├─ d7
│  │  │  ├─ 18fced55a8fba605bb26318c62971bacd20e56
│  │  │  └─ 94ace331ef851db6cf6820b7e180779ed27758
│  │  ├─ d8
│  │  │  ├─ 06cd48bd92b0180556294b9833d89961457add
│  │  │  └─ 3c89b0a0b4113b2e6fb6f1b9fd332615556146
│  │  ├─ d9
│  │  │  └─ c375e8f872568f996acfd990414df4ed689fff
│  │  ├─ da
│  │  │  └─ ad11a85b5243164a4560d3ad45c41c19a368ad
│  │  ├─ db
│  │  │  ├─ 002da20b23e18e859dd847ca56e11fbe879d1a
│  │  │  ├─ 226bf1966df6b4855bb6e0d8255880c4ab5ce3
│  │  │  ├─ 29cdb595d3de0997200e868f24d4829679569d
│  │  │  └─ 35a7740c5c23a7040006db77519743dcb8f717
│  │  ├─ dd
│  │  │  ├─ 440edc92a1d6695bba1671a51389c4e0a40b6f
│  │  │  └─ 80f885af45aa1976a9dde90124400d4a10638d
│  │  ├─ de
│  │  │  └─ b0b583b3852c0c2bca07329bff88d6ee1dc830
│  │  ├─ df
│  │  │  ├─ 18846952ef6e7d70370bf087007fc481c81514
│  │  │  ├─ 4c9ad0ba4ed6fa4f0525b6873442fba088f3cc
│  │  │  ├─ 4f6327185420946b624e7d9c96190459a7aba6
│  │  │  ├─ 7e42f5dd017408ea286049b07ef7f32d0d7200
│  │  │  ├─ 9a1e17fd321e410ca96a5877c0669d0166d640
│  │  │  ├─ bb451d83f2d0bb6cb9aac2d5e0f0f1698c9912
│  │  │  └─ d50ed38fe25d1f3a2409877a93efba9c20e152
│  │  ├─ e1
│  │  │  ├─ 103f5107d84bc6d277ab3da593f1bd76661a03
│  │  │  ├─ 38768343d458a6f1d4a1cc706e7849ca0450be
│  │  │  ├─ 62aeef769a084fe4e6f14c682db11945d546c7
│  │  │  ├─ a9b2269adfff49b0a1e0b796b56e32d5ee82f1
│  │  │  └─ ee80bc76b96af61de30e78e4729f1223467eb3
│  │  ├─ e2
│  │  │  ├─ 0e13407d3afa3456ddba52a56026fa9da0e8a1
│  │  │  ├─ 761b3471f7ed18f833486431c1e713f2561b51
│  │  │  └─ e6b80e1dd506484cfd86b0ee34a2e98fb75e38
│  │  ├─ e3
│  │  │  ├─ 1d60229df1823c8b2230d764c0f3a17ceedc7e
│  │  │  └─ c77030a7079dbea7fbe5264629d0f652a1f859
│  │  ├─ e4
│  │  │  ├─ 5b829fd0eca48cad3ca202f3626d62dea9d9c0
│  │  │  └─ c5fcfe9b284b5dc1b434157e1973a0c2b8a989
│  │  ├─ e6
│  │  │  ├─ 2c35d2679a754b29fecfb1cf3169a391fff691
│  │  │  └─ 791b6ccca40fafc71f94232532dec3b5cf74ff
│  │  ├─ e7
│  │  │  ├─ 8c3a2cb7c56ddea65567631bb36ccec8815d63
│  │  │  ├─ 9520bcdc77eaec6a067c34206ca1eecc19fceb
│  │  │  ├─ d61eb9463862f5c620f273b3beaa3d9048a74d
│  │  │  ├─ dab4682f977bbc5c2f130baf4a0e90b2c330ed
│  │  │  ├─ ef637147fa821a2a8a651a2ae98e06b6782238
│  │  │  └─ fbe7350db2e378738d68ad62e22716d91a73e8
│  │  ├─ e8
│  │  │  └─ 283ecf4f53b636e359347de77231b6025ce464
│  │  ├─ ea
│  │  │  └─ 384852b0690ce1b8bef7246de9d66a41cf6e4f
│  │  ├─ ec
│  │  │  └─ a972ae453a2e6ae27bb5a4b3be8f509e863d14
│  │  ├─ ed
│  │  │  └─ 42d5578a621e1a867709cdbdd2da45c87000bd
│  │  ├─ ee
│  │  │  ├─ 61558da9bfea6d5fe793336aaa47c34d217a92
│  │  │  ├─ 95ecc4cff48ab81f305c16b912a7abad2907a0
│  │  │  └─ e5659ab49180e2b898a3153c234677de941fd2
│  │  ├─ f0
│  │  │  ├─ 0b70ec9feaeec1fbaf26bf36b606ddac9a8a26
│  │  │  ├─ 1f8a7c4d8fc70a59356df9efe3849fb763a11e
│  │  │  ├─ 6a0c1802b8becaec9ee10a6a4bfa4f93550caf
│  │  │  ├─ ba66180a545312147aa773bcabf4ddee3d47a9
│  │  │  └─ c20a17323891e0b194fc78f3aac2e4144974ea
│  │  ├─ f1
│  │  │  ├─ 66440d9b220bb9c752f1df2a07d9fa27bde77e
│  │  │  ├─ 7202005d66c703b42d792acbc5d8b4310b4469
│  │  │  ├─ a4fa88c6a8eed0006155b84d9aa44148bee986
│  │  │  └─ ff99186d61448f87322a4dfe9ae6a38a33e321
│  │  ├─ f2
│  │  │  ├─ 1f325b2d6958ba8045ab38f20f3eeb0a2eba79
│  │  │  └─ 204eebeb49822824130e6614cbd8d285d4208c
│  │  ├─ f3
│  │  │  ├─ 968f23989d2ce6a34d2b64bfe2bf4d07125fdc
│  │  │  └─ a17dc973a355e7c6812f0d2f7d0430953c00f3
│  │  ├─ f4
│  │  │  ├─ 0609e655f6977b8d189c7ab40ffd5ae812311c
│  │  │  ├─ 2fea0e7d990934970388c1dfbdf861e0b292e6
│  │  │  └─ 6934ac65ff34893f4e18c89c62e9266aa5f81d
│  │  ├─ f5
│  │  │  └─ b8c995f0c2205c9180bb8fd2b18817e40783fa
│  │  ├─ f6
│  │  │  ├─ 2be92cea4db7d16532ea388cedb566f704f461
│  │  │  ├─ 8a6705cb6963fc8c173ef56d5a9b87783dec7d
│  │  │  └─ bce35a94352c67efc50875d763b29bbd5caae3
│  │  ├─ f7
│  │  │  ├─ 197cffb6acaa66c19987a179a44e680d6a8d1e
│  │  │  └─ 90c1bec29bb4b1584f6ab33bf5e777dd0ba792
│  │  ├─ f8
│  │  │  ├─ 60daca917f0b554b88d14e37f57107a526f844
│  │  │  └─ 84f2de52a884282b5126a9b670bb56a853c387
│  │  ├─ f9
│  │  │  └─ 958b72032a295649542938d1f10eba8eb326e6
│  │  ├─ fa
│  │  │  ├─ 3640adbb7871ef4ddd54ac995bd1b780e341ed
│  │  │  ├─ 4cc101c3f5130df92a340c7c81e4547a0ea69a
│  │  │  └─ 62218dbbd70f8004061743353c55429fc0bebe
│  │  ├─ fb
│  │  │  └─ a602c9b5cc31a27f757a2e8f8a3875a7da1e4a
│  │  ├─ fc
│  │  │  ├─ 39db109229c468e2467a2f1a4fdaeeeac634ad
│  │  │  └─ dceaf920e2d7fada7332665be33b6bd7b3b0a7
│  │  ├─ fd
│  │  │  ├─ 2759517e43f96f4ba619de6f050e7a6ac812a3
│  │  │  ├─ 28259b4940a118d482d516b3bb0061dfd12cd4
│  │  │  ├─ 31a892848055ee8b355157014c7cd17b30fbf9
│  │  │  ├─ 361d53a7f1a430aa73add5f255230be95da543
│  │  │  ├─ 5be88fcc68aa59dc444e6e315f213fe94c9ca1
│  │  │  └─ 961da3298448f00aed041c56fb06fe424abf1f
│  │  ├─ fe
│  │  │  ├─ 750265ef646129397e4aa4854139717f3d0547
│  │  │  ├─ 788f8dc6a6f956cca8a1383bb7450987fa7b2b
│  │  │  ├─ 8cef4d5931bfa2a9046753139cdd4662208ccf
│  │  │  ├─ c0266a449342ba2333a8a7ee13d19003848c53
│  │  │  ├─ debb81cac5d81a4a02726f80098e9621bf04c3
│  │  │  └─ ec378be77776afdbfa7a6e8782a83f42bc866b
│  │  ├─ ff
│  │  │  ├─ 3ea0d2c9a4eafff4e6ad8af7092747b18d4c04
│  │  │  ├─ 50a486ed553c22288b8c5ef6c55b04cdee6b07
│  │  │  ├─ 6f26349c91b4ab00c247f2f535cbb5e05edbeb
│  │  │  ├─ 760185825fd1c20c9f28eeebc496a7c6861184
│  │  │  ├─ 8365feb4222a631c773f1484f689dcf8d40c67
│  │  │  ├─ 8b589be725752ed502cbd5a99e114eff027a0f
│  │  │  ├─ ded06c1567758fe3f2cc10fc5d2c004731c8a8
│  │  │  └─ eaf004825754b3946bdca9082bbbd23a8648f7
│  │  ├─ info
│  │  └─ pack
│  │     ├─ pack-8f9b7f072e287446b9eac28d07f5a0af6a25f89f.idx
│  │     ├─ pack-8f9b7f072e287446b9eac28d07f5a0af6a25f89f.pack
│  │     ├─ pack-b627cef4d8f7d97471d180511d4801d93d2a3cc2.idx
│  │     └─ pack-b627cef4d8f7d97471d180511d4801d93d2a3cc2.pack
│  ├─ ORIG_HEAD
│  ├─ packed-refs
│  └─ refs
│     ├─ heads
│     │  ├─ feature
│     │  │  └─ persist_data
│     │  └─ master
│     ├─ remotes
│     │  └─ origin
│     │     ├─ HEAD
│     │     ├─ machichiotte-patch-1
│     │     └─ master
│     ├─ stash
│     └─ tags
├─ .gitignore
├─ babel.config.js
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.ico
│  └─ index.html
├─ README.md
├─ router
│  ├─ .htaccess
│  └─ index.js
├─ src
│  ├─ App.vue
│  ├─ assets
│  │  ├─ logo.png
│  │  ├─ logo_exchange_binance.svg
│  │  ├─ logo_exchange_gateio.svg
│  │  ├─ logo_exchange_kucoin.svg
│  │  ├─ logo_exchange_okx.svg
│  │  └─ logo_machi.svg
│  ├─ components
│  │  ├─ AddTrades.vue
│  │  ├─ Cmc.vue
│  │  ├─ Converter.vue
│  │  ├─ Home.vue
│  │  ├─ MySellButton.vue
│  │  ├─ NextSellsTable.vue
│  │  ├─ Orders.vue
│  │  ├─ OrdersTable.vue
│  │  ├─ PieChart.vue
│  │  ├─ Shad.vue
│  │  ├─ ShadOverlay.vue
│  │  ├─ ShadOverlayGraph.vue
│  │  ├─ Strategy.vue
│  │  ├─ Trades.vue
│  │  ├─ TradesTable.vue
│  │  └─ Update.vue
│  ├─ js
│  │  ├─ global.js
│  │  ├─ cells.js
│  │  ├─ columns.js
│  │  ├─ getter.js
│  │  ├─ indexedDB.js
│  │  ├─ orders.js
│  │  └─ spinner.js
│  └─ main.js
└─ vue.config.js

```