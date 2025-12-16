export const ERROR_MESSAGES: Record<string, string> = {
  'User with email was not found': 'Usuario no está registrado.',
  'duplicate key value violates unique constraint "UQ_85432bb369f1a54116c4e4d2ee2"':
    'El correo que intentas registrar ya existe.',
    'User not found': 'El usuario que intentas invitar no está registrado.',
    'User is already assigned to this Cost Center' : 'El usuario que intenta invitar, ya se encuentra asignado a este CC'
};

export const DEFAULT_ERROR_MESSAGE =
  'Ocurrió un error inesperado. Intenta nuevamente.';
