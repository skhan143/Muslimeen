//
//  WidgetData.swift
//  QalbyMuslim
//

import Foundation
import React
import WidgetKit

@objc(WidgetData)
class WidgetData: NSObject, RCTBridgeModule {
    
    static func moduleName() -> String! {
        return "WidgetData"
    }
    
    private let groupIdentifier = "group.com.qalbymuslim.app"
    
    @objc
    func setString(_ key: String, value: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = UserDefaults(suiteName: groupIdentifier) else {
            reject("ERROR", "Failed to access shared UserDefaults", nil)
            return
        }
        
        sharedDefaults.set(value, forKey: key)
        sharedDefaults.synchronize()
        resolve(true)
    }
    
    @objc
    func getString(_ key: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = UserDefaults(suiteName: groupIdentifier) else {
            reject("ERROR", "Failed to access shared UserDefaults", nil)
            return
        }
        
        let value = sharedDefaults.string(forKey: key)
        resolve(value)
    }
    
    @objc
    func reloadTimelines(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadTimelines(ofKind: "QalbyMuslimWidget")
            resolve(true)
        } else {
            reject("ERROR", "Widgets are only available on iOS 14+", nil)
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}