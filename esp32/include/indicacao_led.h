#pragma once

#include <stdint.h>

struct EstadoLeds {
  bool vermelho;
  bool verde;
  bool amarelo;
};

enum class CorLed { Vermelho, Verde, Amarelo };

// As indicações temporárias são calculadas sem bloquear o restante do firmware.
class IndicacaoLeds {
 public:
  void iniciarTroca(uint32_t agora) { inicio_ = agora; modo_ = Modo::Troca; }
  void cancelarTroca() { if (modo_ == Modo::Troca) modo_ = Modo::Normal; }

  void piscar(CorLed cor, uint32_t agora, uint32_t faseMs) {
    if (!faseMs) return;
    cor_ = cor;
    inicio_ = agora;
    faseMs_ = faseMs;
    modo_ = Modo::Piscar;
  }

  EstadoLeds estado(uint32_t agora, bool conectado, bool disponivel) {
    if (modo_ == Modo::Troca) {
      uint32_t decorrido = static_cast<uint32_t>(agora - inicio_);
      if (decorrido < 1000) return {true, false, false};
      if (decorrido < 2000) return {false, false, true};
      return {false, true, false};
    }
    if (modo_ == Modo::Piscar) {
      uint32_t fase = static_cast<uint32_t>(agora - inicio_) / faseMs_;
      if (fase < 6) {
        bool aceso = fase % 2 == 0;
        return {aceso && cor_ == CorLed::Vermelho,
                aceso && cor_ == CorLed::Verde,
                aceso && cor_ == CorLed::Amarelo};
      }
      modo_ = Modo::Normal;
    }
    if (!conectado) return {false, false, (agora / 500U) % 2U == 0};
    return {!disponivel, disponivel, false};
  }

 private:
  enum class Modo { Normal, Troca, Piscar };
  Modo modo_ = Modo::Normal;
  CorLed cor_ = CorLed::Verde;
  uint32_t inicio_ = 0;
  uint32_t faseMs_ = 200;
};
