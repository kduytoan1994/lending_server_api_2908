'use strict'
const app = require('../server')
// const util = require('')
const AccessToken = app.models.AccessToken;
const agency = app.models.agency;
const loan = app.models.loan;
const host = app.models.host;
const investor = app.models.investor;
const lend = app.models.lending;
const interest = app.models.interest;
const wallet = app.models.wallet;
const constant = require('../constant')
const Q = require('q')
exports.checkToken = (token) =>
    new Promise((resolve, reject) => {
        AccessToken.findById(token)
            .then(result => {
                if (result != null)
                    resolve(result)
                else {
                    reject("token not found")
                }
            })
            .catch(err => {
                reject(err);
            })
    })

exports.checkToken1 = (token) =>
    new Promise((resolve, reject) => {
        AccessToken.findOne({ where: { id: token } })
            .then(result => {
                if (result != null)
                    resolve(result)
                else {
                    reject("token not found")
                }
            })
            .catch(err => {
                reject(err);
            })
    })
exports.convertLoan = (loanId) =>
    new Promise((resolve, reject) => {
        var loanTemp;
        loan.findById(loanId)
            .then(loan => {
                loanTemp = loan;
                return host.findById(loan.hostId)
                console.log('loanTemp.amount', loanTemp.amount)
                console.log('loanTemp.called', loanTemp.called)
            })
            .then(host => {
                var result = {
                    id: loanTemp.id,
                    avatar: loanTemp.avatar,
                    name: loanTemp.name,
                    type: loanTemp.typeHome,
                    description: loanTemp.descriptions,
                    money: loanTemp.amount,
                    called: parseFloat(((loanTemp.called / loanTemp.amount) * 100).toFixed(0)),
                    address: host.address,
                    due_date: loanTemp.start_time,
                    range_time: loanTemp.range_time,
                    interest: loanTemp.interest,
                    list_photos: loanTemp.photos
                }
                resolve(result)
            })
            .catch(err => {
                reject(err)
            })
    })
// exports.exchangeMoneyToInvestor = (token, hostId, investorId, amount) =>
//     new Promise((resolve, reject) => {
//         var walletHost, walletInvestor;
//         checkToken(token)
//             .then(token => {
//                 if (token != null) {
//                     return agency.findById(token.userId)
//                 } else {
//                     reject('token invalid!')
//                 }
//             })
//             .then(agency => {
//                 if (agencies == null || agencies.length == 0) {
//                     reject('not agency')
//                 } else {
//                     return loan.findOne({ where: { hostId: hostId, agencyId: agency.id } });
//                 }
//             })
//             .then(host => {
//                 if (host == null) {
//                     reject('host is not of agency')
//                 }
//                 else {
//                     return wallet.findOne({ where: { ownerId: host.id } })
//                 }
//             })
//             .then(wallet => {
//                 walletHost = wallet;
//                 return wallet.findOne({ where: { ownerId: investorId } })
//             })
//             .then(wallet => {
//                 walletInvestor = wallet;
//                 if (walletHost.balance < amount) {
//                     reject('not enough money')
//                 } else {
//                     walletHost.balance -= amount;
//                     walletInvestor.balance += amount;
//                     walletHost.save(err => {
//                         if (err) {
//                             reject(err)
//                         }
//                     });
//                     walletInvestor.save(err => {
//                         if (err) {
//                             reject(err)
//                         }
//                     });
//                 }
//                 resolve("success")
//             })
//             .catch(err => {
//                 reject(err);
//             })
//     })
// exports.exchangeMoney = (token, receiveId, sendId, amount) =>
//     new Promise((resolve, reject) => {
//         var sendWallet, receiveWallet;
//         checkToken(token)
//             .then(token => {
//                 if (token != null) {
//                     return wallet.findOne({ where: { ownerId: sendId } })
//                 } else {
//                     reject('token invalid!')
//                 }
//             })
//             .then(wallet => {
//                 sendWallet = wallet;
//                 return wallet.findOne({ where: { ownerId: receiveId } })
//             })
//             .then(wallet => {
//                 receiveWallet = wallet;
//                 if (sendWallet.balance < amount) {
//                     reject('not enough money')
//                 } else {
//                     sendWallet.balance -= amount;
//                     receiveWallet.balance += amount;
//                     sendWallet.save(err => {
//                         if (err) {
//                             reject(err)
//                         }
//                     });
//                     receiveWallet.save(err => {
//                         if (err) {
//                             reject(err)
//                         }
//                     });
//                 }
//                 resolve("success")
//             })
//             .catch(err => {
//                 reject(err);
//             })
//     })
var exchangeMoneyWithoutToken = (receiveId, sendId, amount) =>
    new Promise((resolve, reject) => {
        var receiveWallet, sendWallet;
        wallet.findOne({ where: { ownerId: sendId } })
            .then(wallets => {
                sendWallet = wallets;
                return wallet.findOne({ where: { ownerId: receiveId } })
            })
            .then(wallet => {
                receiveWallet = wallet;
                if (sendWallet.balance < amount) {
                    reject('not enough money')
                } else {
                    var balanceSend = sendWallet.balance * 1000000;
                    var addSub = amount * 1000000;
                    var balanceReceive = receiveWallet.balance * 1000000;

                    sendWallet.balance = parseFloat(((balanceSend - addSub) / 1000000).toFixed(2));
                    receiveWallet.balance = parseFloat(((balanceReceive + addSub) / 1000000).toFixed(2));
                    sendWallet.save(err => {
                        if (err) {
                            reject(err)
                        }
                    });
                    receiveWallet.save(err => {
                        if (err) {
                            reject(err)
                        }
                    });
                }
                resolve("success")
            })
            .catch(err => {
                reject(err);
            })
    })
var chageMoney = (sendId, receiveId, amount) =>
    new Promise((resolve, reject) => {
        var receiveWallet, sendWallet;
        wallet.findOne({ where: { ownerId: sendId } })
            .then(wallets => {
                sendWallet = wallets;
                console.log('receiveId : ', receiveId)
                return wallet.findOne({ where: { ownerId: receiveId } })
            })
            .then(wallet => {
                receiveWallet = wallet;
                console.log('utilsWallet', receiveWallet)
                if (sendWallet.balance < amount) {
                    reject('not enough money')
                } else {
                    var balanceSend = sendWallet.balance * 1000000;
                    var addSub = amount * 1000000;
                    var balanceReceive = receiveWallet.balance * 1000000;

                    sendWallet.balance = parseFloat(((balanceSend - addSub) / 1000000).toFixed(2));
                    receiveWallet.balance = parseFloat(((balanceReceive + addSub) / 1000000).toFixed(2));
                    sendWallet.save(err => {
                        if (err) {
                            console.log('send errorr')
                            reject(err)
                        }
                    });
                    receiveWallet.save(err => {
                        if (err) {
                            console.log('receiveId error')
                            reject(err)
                        }
                    });
                }
                resolve("success")
            })
            .catch(err => {
                reject(err);
            })
    })
exports.chageMoney = chageMoney;
exports.reCallAllMoneyOfLoan = (loanId) =>
    new Promise((resolve, reject) => {
        var hostTemp;
        var promises = [];
        loan.findById(loanId)
            .then(loan => {
                return host.findById(loan.hostId)
            })
            .then(host => {
                hostTemp = host;
                return lend.find({ where: { loanId: loanId } })
            })
            .then(lends => {
                if (lends == null || lends.length == 0) {
                    resolve("success")
                }
                console.log('lends', lends)
                lends.forEach(lend => {
                    promises.push(investor.findById(lend.investorId)
                        .then(investor => {
                            return exchangeMoneyWithoutToken(investor.id, constant.ID_SYSTEM, lend.amount)
                        })
                        .catch(err => {
                            console.log('errrdsf ', err)
                            reject(err)
                        })
                    )
                    Q.all(promises)
                        .then(result => {
                            console.log('success dfdafdf')
                            resolve("success")
                        })
                })

            })
            .catch(err => {
                console.log('errrdsf12 ', err)
                reject(err)
            })
    })
exports.convertInvestor = (investors) =>
    new Promise((resolve, reject) => {
        var result = [];
        var total = 0;
        var promises = [];
        investors.forEach(investor => {
            promises.push(lend.find({ where: { investorId: investor.id } })
                .then(lends => {
                    if (lends.length == 0) {
                        resolve({ result: [] });
                    } else {
                        lends.forEach(lend => {
                            total += lend.amount;
                        })
                    }
                    result.push({
                        name: investor.name,
                        lended_money: total,
                        avatar: investor.avatar
                    })
                })
                .catch(err => {
                    reject(err);
                })
            )

        })
        Q.all(promises)
            .then(() => {
                resolve({ result: result })
            })
            .catch(err => {
                reject(err);
            })

    })
exports.convertLoans = (loans) =>
    new Promise((resolve, reject) => {
        var promises = [];
        for (var i = 0; i < loans.length; i++) {
            promises.push(util.convertLoan(loans[i].id)
                .then(loanHost => {
                    listLoan.push(loanHost)
                })
            )
        }
        Q.all(promises)
            .then(() => {
                var data = {
                    list_loan: listLoan,
                    total_page: loans.length / perPage + 1
                }
                var response = new CommonResponse("success", "", data)
                console.log("response", response)
                res.json(response)
            })
            .catch(err => {
                var response = new CommonResponse("error", "", err)
                console.log("response", response)
                res.json(response)
            })

    })
exports.convertInterest = (interest) =>
    new Promise((resovle, reject) => {
        var result = {
            id_lend: interest.lendingId,
            date: interest.date,
            money: interest.money,
            status: interest.status
        }
        resolve(result)

    })
exports.updateFullLoan = (loanId, total) =>
    new Promise((resolve, reject) => {
        var promises = [];
        var loanTemp, lendTemps;
        loan.findById(loanId)
            .then(loanResult => {
                loanTemp = loanResult;
                return lend.find({ where: { loanId: loanId } })
            })
            .then(lends => {
                lendTemps = lends;
                lends.forEach(lend => {
                    lend.status = 1;
                    promises.push(lend.save())
                })
                return Q.all(promises)
            })
            .then(() => {
                lendTemps.forEach(lendItem => {
                    let rate;
                    var money = loanTemp.amount;
                    if (money < 30) {
                        rate = 2;
                    } else if (money < 80) {
                        rate = 5
                    } else {
                        rate = 15
                    }
                    //tao cac interest
                    let promisesInterest = [];
                    var range_time = loanTemp.range_time;
                    for (var j = 1; j <= range_time; j++) {
                        let day;
                        console.log('jUtil yy', j)
                        promisesInterest.push(
                            dayAfterSomeMonth(loanTemp.start_time, j)
                                .then(result => {
                                    day = result.result;
                                    return interest.create({
                                        order: j,
                                        date: day,
                                        money: parseFloat(((lendItem.amount * rate) / 100 + lendItem.amount / range_time).toFixed(2)),
                                        rate: rate,
                                        loanId: loanTemp.id,
                                        lendingId: lendItem.id,
                                        status: 0
                                    })
                                })
                                .catch(err => {
                                    var response = new CommonResponse("fail", "", err)
                                    console.log("response", response)
                                    res.json(response)
                                })
                        )
                    }
                })

                return Q.all(promisesInterest);
            })
            .then(() => {
                return host.findById(loanTemp.hostId)
            })
            .then(host => {
                return exchangeMoneyWithoutToken(host.id, constant.ID_SYSTEM, loanTemp.amount)
            })
            .then(result => {
                if (result == "success") {
                    resolve("success");
                } else {
                    reject("exchange money error")
                }
            })
            .catch(err => {
                reject(err)
            })
    })
exports.getNextInterestLend = (lendId) =>
    new Promise((resolve, reject) => {
        var date = new Date();
        var now = date.getFullYear() + '' + date.getMonth() + date.getDate();
        var min, interestMin;
        interest.find({ where: { lendingId: lendId } })
            .then(interests => {
                interestMin = interests[0];
                min = interests[0].date;
                interests.forEach(interestItem => {
                    var date = interestItem.date;
                    var converTime = date.subString(6, 9) + date.subString(3, 4) + date.subString(0, 1);
                    if (convertTime > now && converTime < min) {
                        min = converTime;
                        interestMin = interestItem;
                    }
                })
                resolve(interestMin);
            })
            .catch(err => {
                reject(err)
            })
    })
var converTime = (date) =>
    new Promise((resolve, reject) => {

    })
exports.convertPackage = (listPackage) =>
    new Promise((resolve, reject) => {
        var result = [];
        listPackage.forEach(packages => {
            result.push({
                id: packages.id,
                money: packages.amount,
                chosen: packages.status
            })
        })
        resolve(result)
    })


var dayAfterSomeMonth = (day, range_time) =>
    new Promise((resolve, reject) => {
        var dayTemp = day.split('/');
        var year = parseInt(dayTemp[2]);
        var month = parseInt(dayTemp[1]);
        var date = parseInt(dayTemp[0]);
        var monthTemp = month + range_time;
        var monthResult, yearResult;
        if (monthTemp < 10) {
            monthResult = '0' + monthTemp
            yearResult = year + '';
        } else if (monthTemp <= 12) {
            monthResult = monthTemp + '';
            yearResult = year + '';
        } else if (monthTemp < 22) {
            monthResult = '0' + (monthTemp - 12).toString();
            yearResult = (year + 1).toString();
        } else {
            monthResult = monthTemp + '';
            yearResult = (year + 1) + ''
        }
        var result = date + '/' + monthResult + '/' + yearResult
        console.log('result', result)
        resolve({ result: result })
    })
exports.getInterestNearestOfLend = (lendId) =>
    new Promise((resolve, reject) => {
        var datenow = '' + new Date().getFullYear() + (new Date().getMonth() + 2) + new Date().getDate();
        lend.findById(lendId)
            .then(lendResult => {
                return interest.find({ where: { lendId: lendResult.id, status: 0 } })
            })
            .then(interests => {
                if (interests.length > 0) {
                    var interestMin = interests[0]
                    interests.forEach(interestItem => {
                        var dateInterest = interestItem.date.subString(6, 9) + interestItem.date.subString(3, 4)
                            + interestItem.date.subString(0, 1);
                        if (dateInterest <= datenow) {
                            resolve(interestItem);
                        }
                    })
                } else {
                    var temp = []
                    resolve(temp)
                }
            })
            .catch(err => {
                reject(err)
            })
    })
exports.payInterest = (loanId) => {
    var hostTemp, promises = [];
    loan.findById(loanId)
        .then(loanResult => {
            return host.findOne({ where: { loanId: loanResult.id } })
        })
        .then(host => {
            hostTemp = host
            return lend.find({ where: { loanId: loanId } })
        })
        .then(lends => {
            lends.forEach(lendItem => {
                promises.push(chageMoney(hostTemp.id, lendItem.investorId)
                    .then(result => {
                        console.log(result)
                    })
                    .catch(err => {
                        reject(err)
                    })
                )
            })
            return Q.all(promises)
        })
        .then(()=>{
            resolve('success')
        })
        .catch(err=>{
            reject(err)
        })
}