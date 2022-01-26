# node-red-contrib-sectoralarm

A Node-RED node to connect to your Sector Alarm site which enables you to toggle your alarm, fetch the current status and your alarms recent event history. You can also inject checks at intervals, so you can get notified when the alarm's status change. Typical usage would be turning on/off lights when arming or disarming your alarm.

## Supported features

* Checking current status of alarm, annex and connected door locks
* History of arming/disarming the alarm
* Temperature readings from connected sensors
* Acting on your alarm. Support for arming, disarming and partial arming
* Acting on your annex alarm. Support for Arming and disarming.
* Lock and unlock your connected door locks

## Supported in the following countries

Country     | Site                       | Verified
----------- | -------------------------- | -----------
Sweden      | http://www.sectoralarm.se  | Yes
Norway      | http://www.sectoralarm.no  | Yes
Finland     | http://www.sectoralarm.fi  | Yes
Spain       | http://www.sectoralarm.es  | No
Ireland     | http://www.phonewatch.ie   | No

If you use this library in a country listed above as not verified, please drop me a note.
You can visit Sector Alarm Group http://www.sectoralarm.com 

## References

This package is based on my general library for sector alarm. Found here:

* https://github.com/perbrage/sectoralarm

![Usage screenshot](https://raw.githubusercontent.com/perbrage/node-red-contrib-sectoralarm/master/screenshot.png "Example usage of node")

## Changelog

### v1.4.0 - 2022-01-24

* Updated to use the latest base package, which includes retry funtionallity for getStatus, this can avoid invalid 401 Unauthorized
  errors when polling to fast, or when sector alarm servers act up.
* UI has been updated to be able to assign number of retries, and the retry delay. Default values are 3 retries, with 3000ms delay.
  Use these until you avoid getting 401 Unauthorized errors (if getting them when you shouldn't).
* Code has always been an optional parameter, used for armin/disarming and locking. As sector alarm allows you to configure your
  system to arm without a code, a code is no longer required for arm, partialArm or annexArm.
* Configuration UI has been made looking a tad nicer with sections and new tips.
* Underlying security updates of packages.
