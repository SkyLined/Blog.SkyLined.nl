MSIE 8-11 MSHTML DOMImplementation type confusion
=================================================

([MS16-009][], [CVE-2016-0063][])

[MS16-009]: https://technet.microsoft.com/library/security/MS16-009
[CVE-2016-0063]: http://www.cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2016-0063

Synopsis
--------
A specially crafted web-page can cause a type confusion vulnerability in
Microsoft Internet Explorer 8 through to 11. An attacker can cause code to be
executed with a stack layout it does not expect, or have code attempt to
execute a method of an object using a vftable, when that object does not have
a vftable. Successful exploitation can lead to arbitrary code execution.

Known affected software and attack vectors
------------------------------------------
+ **Microsoft Internet Explorer 8, 9, 10 and 11**

  An attacker would need to get a target user to open a specially crafted
  web-page. Disabling Javascript should prevent an attacker from triggering the
  vulnerable code path.
