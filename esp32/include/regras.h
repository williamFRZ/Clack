#pragma once
#include <string.h>
enum class Decisao { Negar, Abrir, Fechar, Transferir };
inline Decisao decidir(const char* estado, int responsavel, int pessoa, const char* perfil) {
 if(!strcmp(estado,"manutencao")||!strcmp(estado,"erro")) return Decisao::Negar;
 if(!strcmp(estado,"disponivel")) return Decisao::Abrir;
 if(strcmp(estado,"em_uso")) return Decisao::Negar;
 if(responsavel==pessoa) return Decisao::Fechar;
 if(!strcmp(perfil,"professor")||!strcmp(perfil,"completo")) return Decisao::Transferir;
 return Decisao::Negar;
}
