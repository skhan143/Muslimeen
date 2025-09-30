//
//  WidgetData.m
//  QalbyMuslim
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetData, NSObject)

RCT_EXTERN_METHOD(setString:(NSString *)key 
                  value:(NSString *)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getString:(NSString *)key
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reloadTimelines:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end