#pragma once
#include <stdint.h>
#include <string.h>

enum class AmostraArmario { Presente, Ausente, Erro };
enum class AcaoArmario { Nenhuma, Alternar, Cadastrar };

// A mesma tag precisa ser observada repetidamente por dez segundos. Depois de
// uma operação, 700 ms de ausência confirmada são necessários para outra.
class ControleArmario {
 public:
  AcaoArmario observar(AmostraArmario amostra, const char* uid, bool autorizado, uint32_t agora) {
    if (amostra == AmostraArmario::Erro) {
      candidato_[0] = 0;
      ausente_ = false;
      return AcaoArmario::Nenhuma;
    }
    if (amostra == AmostraArmario::Ausente) {
      if (candidato_[0] && uint32_t(agora - ultima_leitura_) > 250) candidato_[0] = 0;
      if (bloqueado_) {
        if (!ausente_ || uint32_t(agora - ultima_ausencia_) > 250) {
          ausente_ = true;
          inicio_ausencia_ = agora;
        }
        ultima_ausencia_ = agora;
        if (uint32_t(agora - inicio_ausencia_) >= 700) {
          bloqueado_ = false;
          ausente_ = false;
        }
      }
      return AcaoArmario::Nenhuma;
    }
    ausente_ = false;
    if (!uid || !*uid || strlen(uid) > 29) { candidato_[0] = 0; return AcaoArmario::Nenhuma; }
    if (bloqueado_) return AcaoArmario::Nenhuma;
    if (autorizado) {
      candidato_[0] = 0;
      bloqueado_ = true;
      return AcaoArmario::Alternar;
    }
    if (!candidato_[0] || strcmp(candidato_, uid) || uint32_t(agora - ultima_leitura_) > 250) {
      strcpy(candidato_, uid);
      inicio_cadastro_ = ultima_leitura_ = agora;
      return AcaoArmario::Nenhuma;
    }
    ultima_leitura_ = agora;
    if (uint32_t(agora - inicio_cadastro_) < 10000) return AcaoArmario::Nenhuma;
    candidato_[0] = 0;
    bloqueado_ = true;
    return AcaoArmario::Cadastrar;
  }
 private:
  char candidato_[30] = {};
  uint32_t inicio_cadastro_ = 0, ultima_leitura_ = 0;
  uint32_t inicio_ausencia_ = 0, ultima_ausencia_ = 0;
  bool bloqueado_ = false, ausente_ = false;
};
