#include <cassert>
#include <cstdint>
#include "../esp32/include/indicacao_led.h"

static bool igual(EstadoLeds e, bool r, bool v, bool a) {
  return e.vermelho == r && e.verde == v && e.amarelo == a;
}

int main() {
  IndicacaoLeds leds;
  assert(igual(leds.estado(0, true, true), false, true, false));
  assert(igual(leds.estado(0, true, false), true, false, false));
  assert(igual(leds.estado(0, false, true), false, false, true));
  assert(igual(leds.estado(500, false, true), false, false, false));
  leds.iniciarTroca(1000);
  assert(igual(leds.estado(1000, true, false), true, false, false));
  assert(igual(leds.estado(1999, true, false), true, false, false));
  assert(igual(leds.estado(2000, false, false), false, false, true));
  assert(igual(leds.estado(2999, true, false), false, false, true));
  assert(igual(leds.estado(3000, true, false), false, true, false));
  assert(igual(leds.estado(4000, false, false), false, true, false));
  leds.cancelarTroca();
  assert(igual(leds.estado(3000, true, false), true, false, false));
  leds.iniciarTroca(3000);
  leds.piscar(CorLed::Verde, 6000, 200);
  for (uint32_t n = 0; n < 6; ++n)
    assert(igual(leds.estado(6000 + n * 200, false, false), false, n % 2 == 0, false));
  assert(igual(leds.estado(7200, false, false), false, false, true));
  assert(igual(leds.estado(7200, true, false), true, false, false));
  const uint32_t inicio = UINT32_MAX - 150;
  leds.iniciarTroca(inicio);
  assert(igual(leds.estado(inicio + 999U, true, true), true, false, false));
  assert(igual(leds.estado(inicio + 1000U, true, true), false, false, true));
  assert(igual(leds.estado(inicio + 2000U, true, true), false, true, false));
  leds.piscar(CorLed::Vermelho, inicio, 300);
  assert(igual(leds.estado(inicio + 1200U, true, true), true, false, false));
  assert(igual(leds.estado(inicio + 1800U, true, true), false, true, false));
}
