#include <Arduino.h>
#include <U8g2lib.h>
#ifdef U8X8_HAVE_HW_SPI
#include <SPI.h>
#endif
#ifdef U8X8_HAVE_HW_I2C
#include <Wire.h>
#endif

U8G2_SSD1306_128X64_ALT0_F_HW_I2C u8g2(U8G2_R0, /* reset=*/U8X8_PIN_NONE); // SSD1306 and SSD1308Z are compatible

// U8G2_SSD1306_128X64_NONAME_F_SW_I2C u8g2(U8G2_R0, /* clock=*/ SCL, /* data=*/ SDA, /* reset=*/ U8X8_PIN_NONE);    //Low spped I2C
String incomingByte = "";

void setup(void)
{
  u8g2.begin();
  Serial.begin(9600);
}

void loop(void)
{
  if (Serial.available() > 0)  {
    // read the incoming byte:
    incomingByte = Serial.readString();

    // say what you got:
    Serial.print("I received: ");
    Serial.println(incomingByte);
    u8g2.clearBuffer();                        // clear the internal memory
    u8g2.setFont(u8g2_font_ncenB08_tr);        // choose a suitable font
   
    //itoa(incomingByte, buf, 10);
    u8g2.drawStr(0, 10, incomingByte.c_str()); // write something to the internal memory
    u8g2.sendBuffer();                         // transfer internal memory to the display
    delay(1000);
  }
}