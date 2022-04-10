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
int ledPort = 4;
int buzzer = 5;
int button = 6;
int totalMessages = 0;
int sensorValue;

void setup(void)
{
  pinMode(buzzer, OUTPUT);
  pinMode(ledPort, OUTPUT);
  pinMode(button, INPUT);
  pinMode(A0, INPUT);
  sensorValue = analogRead(A0);
  u8g2.begin();
  Serial.begin(9600);
  
}

static void print_string(const char *string) {
  u8g2.clearBuffer();                 // clear the internal memory
  u8g2.setFont(u8g2_font_ncenB08_tr); // choose a suitable font
  u8g2.drawStr(0, 10, string);        // write something to the internal memory
  u8g2.sendBuffer();                  // transfer internal memory to the display
}

void loop(void) {
  delay(1000);

  if (Serial.available() > 0)  {
    totalMessages ++;
    digitalWrite(ledPort, HIGH);
    tone(buzzer, 1000);
    delay(100);
    digitalWrite(ledPort, LOW);
    noTone(buzzer);
    // read the incoming byte:
    incomingByte = Serial.readString();

    // say what you got:
    Serial.print("I received: ");
    Serial.println(incomingByte);
  
    const char *string = incomingByte.c_str();
    do {
      print_string(string);
      delay(100);
    } while (u8g2.getStrWidth(string++) > u8g2.getWidth());

    delay(1000);
  } else if (digitalRead(button) == HIGH) {
     if (analogRead(A0) > 960) {
      Serial.write(-1);
    } else if (analogRead(A0) < 650) {
      Serial.write(1);
    }
  } 
}