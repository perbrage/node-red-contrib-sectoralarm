# node-red-contrib-sectoralarm

A Node-RED node to connect to your Sector Alarm site which enables you to toggle your alarm, fetch the current status and your alarms recent event history. You can also inject checks at intervals, so you can get notified when the alarm's status change. Typical usage would be turning on/off lights when arming or disarming your alarm.

# Fork changes
This was forked from Per Brage project https://github.com/perbrage/node-red-contrib-sectoralarm
I only removed the need for entering your alarm code when arming or partially arming your system.
Since this option can be set, at least for the Swedish systems, it was time to implement.
I also sent a pull request to the original repository but the oldest untouched pull reqeust is almost
two years old. All other code and text is made by Per Brage. Thanks Per! /Kristofer

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
